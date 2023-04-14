<?php
/*
 * This file is part of the Onebot portal source code.
 *
 */

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Location;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;

/**
 * Provides API endpoints for interacting with the location and administrative units resources.
 * These also include endpoints for downloading and uploading of locations definitions spreadsheet file.
 * 
 */
#[AsController]
class LocationController extends AbstractController
{
    /**
     * This is the location resource main API endpoint controller.
     *
     * @param Request $request
     * @param string|null $type
     * @param string|null $page
     * @return mixed
     */

    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }


    public function __invoke(Request $request, string $type = null, string $locale = null, string $page = null) : mixed
    {  
        if(str_contains($request->getRequestUri(), 'download'))
        {
            return $this->export_locations_template();
        }
        else if (str_contains($request->getRequestUri(), 'upload')) { 
           //This is a file object for upload.                       
           return $this->upload_action($request);    
        }
        else if (str_contains($request->getRequestUri(), 'ux_list')) { 
            return $this->locations_for_ux($locale,$type,$page);    
         }
        else
        {
            $units = $this->get_administration_units(true);
            return ['last_id' => $units['id'], 'columns' => array_merge(array_reverse($units['path']), $this->get_location_extra_field_names())];
        }        
    }

    /**
     * This function returns the list of locations for display on the UX.
     */
    public function locations_for_ux($locale,$type,$page=1,$limit=15)
    {
        $em = $this->doctrine->getManager();
        $read_sql = "WITH RECURSIVE locations_fetch (id, name, path, type_id, longitude, latitude) AS
        (
          SELECT l.id, t.name, CONCAT('{\"type\":',l.type_id,',\"name\":\"',CAST(t.name AS CHAR(200)),'\"},'), type_id, longitude, latitude
            FROM location l JOIN administrative_unit u ON u.id = l.type_id
            JOIN administrative_unit_translation t ON u.id = t.translatable_id
            WHERE l.parent_id IS NULL AND t.locale = '".$locale."'
          UNION ALL
          SELECT l.id, l.name, CONCAT(lf.path,'{\"type\":',l.type_id,',\"name\":\"', l.name,'\"},'), l.type_id, l.longitude, l.latitude
            FROM locations_fetch AS lf 
            JOIN location AS l ON lf.id = l.parent_id 
            JOIN administrative_unit u ON u.id = l.type_id
        )
        SELECT id,path, longitude, latitude FROM locations_fetch WHERE type_id = ".$type." ORDER BY id LIMIT ".strval(($page*$limit)-$limit).",".$limit;                    
        $read_statement = $em->getConnection()->prepare($read_sql);
        $r_result = $read_statement->execute()->fetchAll(); 
        return $r_result;
    }

    /**
     * Creates an excel file in XLSX format with cell title values generated from the
     * AdministrationsUnit entity 'names' fieldnames.  
     * returns an excel file attached in the api response.
     */
    public function export_locations_template()
    {
        //create excel spreadsheet document instance object 
        $spreadsheet = new Spreadsheet();  
        
        $sheet = $spreadsheet->getActiveSheet();
        //Fetch administration units field names to use as title fields in the excel document.
            
        $results = $this->get_administration_units();

        if(!$results)
        {            
            return new JsonResponse ( ["details"=>"Adminstrative units needs to be set inorder to use this functionality.", "code" => 404]);
        }

        $locationExtraFieldNames = $this->get_location_extra_field_names();

        $column = 1;
        foreach($results as $result)
        {
            $sheet->setCellValueByColumnAndRow($column, 1 , $result); 
            $column++;          
        }
        foreach($locationExtraFieldNames as $extraFieldName)
        {
            $sheet->setCellValueByColumnAndRow($column++, 1 , ucwords($extraFieldName));
        }

        //format and style the output document's title field names 
        $title = 'A';
        for($i = 1, $point = 1 ; $i < $column; $i++, $title++)
        {
            $cell = $title . $point;
            $style = $sheet->getStyle($cell);
            $style->getFont()->setBold(true);
            $sheet->getColumnDimension($title)->setAutoSize(true);
            $style->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setARGB('000FFF00');            
        }         
               
        $sheet->setTitle("Locations Capture Worksheet");
        
        // Create Excel (XLSX Format)
        $writer = new Xlsx($spreadsheet);
        
        // Create a Temporary file in file system
        $fileName = 'locations.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $fileName);
        
        // save the excel file in the tmp directory of the system
        $writer->save($temp_file);
        
        // Return the excel file as an attachment
        return $this->file($temp_file, $fileName, ResponseHeaderBag::DISPOSITION_ATTACHMENT);
    } 

    /**
    * Locations definition file in excel xslx format is uploaded to the server temp directory.
    * Reading and parsing operations are done on the file with the content inserted into the 
    * location table. 
    */
    public function upload_action(Request $request) {
        try {
            $file = $request->files->get ( 'file' );
            $clear_table = $request->get ( 'clear_locations_table' );

            $fileName = md5 ( uniqid () ) . '.' . $file->guessExtension ();
            
            $file->move (sys_get_temp_dir(), $fileName );  

            $this -> import_locations_file(sys_get_temp_dir() . '/' . $fileName, $clear_table);
            $array = array (
                'details' => 'File uploaded.', 
                'code' => 201             
            );
            $response = new JsonResponse ( $array, \Symfony\Component\HttpFoundation\Response::HTTP_CREATED );
            return $response;
        } catch ( Exception $e ) {
            $array = array (
                'details' => 'Error uploading file.', 
                'code' => 400             
            );
            $response = new JsonResponse($array, \Symfony\Component\HttpFoundation\Response::HTTP_BAD_REQUEST);
            return $response;
        }
    }

    /**
     * This function returns an array of administrative units formatted hierechicaly 
     * from the main unit to the least unit.
     */
    private function get_administration_units($locale, $return_id = false)
    {
        $em = $this->doctrine->getManager();
        $read_sql = "WITH RECURSIVE admin_unit_paths (id, name, path) AS
        (
          SELECT a.id, at.name, CAST(at.name AS CHAR(200))
            FROM administrative_unit a 
            JOIN administrative_unit_translation at ON a.id = at.translatable_id
            WHERE parent_id IS NULL AND at.locale = '".$locale."'
          UNION ALL
          SELECT e.id, et.name, CONCAT(ep.path, ',', et.name)
            FROM admin_unit_paths AS ep 
            JOIN administrative_unit AS e ON ep.id = e.parent_id
            JOIN administrative_unit_translation et ON e.id = et.translatable_id
            WHERE et.locale = '".$locale."'
        )
        SELECT id, path FROM admin_unit_paths ORDER BY path DESC LIMIT 1;";  
        $read_statement = $em->getConnection()->prepare($read_sql);
        $r_result = $read_statement->execute()->fetchAll(); 
        if($return_id)
            return ['id' => $r_result[0]['id'], 'path' => explode(",",$r_result[0]['path'])];
        else
            return explode(",",$r_result[0]['path']);
    }

    /**
     * @return array containing administrative unit ordered in a parent to children
     * heirachy
     */
   private function get_administration_units_list($limit = 50)
   {
        $em = $this->doctrine->getManager();
        $read_sql = 'SELECT parent_id, id FROM administrative_unit ORDER BY parent_id ASC LIMIT '. $limit;                    
        $read_statement = $em->getConnection()->prepare($read_sql);
        $r_result = $read_statement->execute()->fetchAll();                
        return $r_result;
   }
   /**
    * @return array containing location table field names with id, 
    * name, type_id and parent_id field names excluded.
    */
   private function get_location_extra_field_names()
   {
        $entityManager = $this->doctrine->getManager();
        $cmf = $entityManager->getMetadataFactory();
        $class = $cmf->getMetadataFor(Location::class);
        $output = [];
        foreach($class->fieldMappings as $fieldMapping)
        {
            if(in_array($fieldMapping['fieldName'], ['id','name','type_id', 'parent_id']))
                continue;
                array_push($output, $fieldMapping['fieldName']);
        }
         
        return $output;
   }
   /**
    * Delete all location table row data.
    */
    public function clear_locations_table()
    {
        $em = $this->doctrine->getManager();
        $sql = 'SET FOREIGN_KEY_CHECKS = 0';
        $statement = $em->getConnection()->prepare($sql);
        $sresult = $statement->execute(); 

        $sql = 'DELETE FROM location WHERE id > 0
            ORDER BY id DESC;';
        $statement = $em->getConnection()->prepare($sql);
        $sresult = $statement->execute(); 

        $sql = 'SET FOREIGN_KEY_CHECKS = 1';
        $statement = $em->getConnection()->prepare($sql);
        $sresult = $statement->execute(); 
    }
    /**
     * Parsers the spreadsheet file uploaded over the api and inserts it's records
     * to the Locations table.
     */
    public function import_locations_file($file, $clear_table)
    { 
        $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
        $reader->setReadDataOnly(true);
        $reader->setReadFilter( new xlsReadFilter() );
        
        $workSheet = $reader->load($file);

        $sheet = $workSheet->getActiveSheet();
        
        $highestRow = $sheet->getHighestRow(); // e.g. 1
        $highestColumn = $sheet->getHighestColumn(); // e.g 'A'
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn); // e.g. 5            
        
        set_time_limit($highestRow * 2); 

        if($clear_table)
        {
            $this->clear_locations_table();
        }

        $sql = 'INSERT IGNORE INTO location (id, type_id, parent_id, name, longitude, latitude )
                VALUES (:id, :type_id, :parent_id, :name, :longitude, :latitude)';

        $em = $this->doctrine->getManager();        

        $statement = $em->getConnection()->prepare($sql); 

        $administrative_ids = $this->get_administration_units_list();

        //get location lat-long fields.
        $locationExtraFieldNames = $this->get_location_extra_field_names();
        
        //Valid data can be fetched from rows starting row 2
        $id = 1;
        $locations_cache = [];
        for ($row = 2; $row <= $highestRow; ++$row) {
            
            for ($col = 1; $col <= $highestColumnIndex-2; ++$col) {

                $str = $sheet->getCellByColumnAndRow($col, $row)->getValue();

                //format the cell value fields

                //lower case all characters for this cell
                $str = strtolower($str);

                //remove extra space characters in between the words and trim leading and trailing space characters.
                $name = trim(preg_replace('/\s\s+/', ' ', str_replace("\n", " ", $str)));

                //Capitalize the first letters in the words of the string
                $name = ucwords($name);

                $r_result = NULL;

                //check if the record read from the current spreadsheet cell exists in the local cache.

                $type_id = $administrative_ids[$col-1]['id'];                

                if((isset($locations_cache[$name][$type_id]) == NULL))
                {
                    //extend the search to the database table  
                    $read_sql = 'SELECT name, type_id FROM location WHERE (location.name = :name AND location.type_id = :type_id) LIMIT 1';
                    $read_statement = $em->getConnection()->prepare($read_sql);
                    $read_statement->bindValue('name', $name);
                    $read_statement->bindValue('type_id', $type_id);
                    $r_result = $read_statement->execute()->fetchAll();

                    if($r_result)
                    {
                      
                      $r_result = array_shift($r_result);
                      //update the cache with this row
                      $locations_cache[$name] = $r_result;  

                    }  
                }
                else
                {   
                    //use the cached row's dataset
                    $r_result = $locations_cache[$name]; 
                }
                
                //Insert a record if it does not exist in the table 
                if (!$r_result ) {
                
                $statement->bindValue(':id', $id);
                $statement->bindValue(':name', $name);  
                //parent type id     
                $statement->bindValue(':type_id', $administrative_ids[$col-1]['id']);

                //Read the parent's field name from the spreadsheet title row which basicaly is the first one.
                $parent_name = $sheet->getCellByColumnAndRow(($col == 1) ? $col : $col - 1, $row)->getValue();

                $read_sql = 'SELECT name, id FROM location where location.name = :name LIMIT 1';
                
                $read_statement = $em->getConnection()->prepare($read_sql);

                //search for the id associated with the parent id  
                $read_statement->bindValue(':name', $parent_name);
                $r_result = $read_statement->execute()->fetchAll();

                if($r_result)
                {
                    $r_result = array_shift($r_result);
                     $parent_id = $r_result['id'];  
                }  
                else
                {
                    //no record found use the current value in variable $id as parent ID.
                     $parent_id = null;    
                }            

                $statement->bindValue(':parent_id', $parent_id );                
                
                //update lat-long coordinates for the administrative unit node 
                $index = count($locationExtraFieldNames); 

                foreach($locationExtraFieldNames as $extraFieldName)
                {
                    $index--;                    
                    $statement->bindValue(':' . $extraFieldName, ($col == $highestColumnIndex - count($locationExtraFieldNames)) ? $sheet->getCellByColumnAndRow($highestColumnIndex - $index, $row)->getValue() : null);
                }
                                             
                //persist the record into the database table
                $sresult = $statement->execute();  
                $id += 1;
                }
                
            }

        }        
       
    }    
}
/**
* Xsl reader class for implementing readers filters. 
*/
class xlsReadFilter implements \PhpOffice\PhpSpreadsheet\Reader\IReadFilter {

/**
 * Sets constraints on the cells to read.
 */
public function readCell($columnAddress, $row, $worksheetName = '') {
    
    if ($row >= 1) {
        return true;
    }
    return false;
  }
}
