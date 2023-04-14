<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use App\Entity\AdminUser;
use Doctrine\DBAL\Schema\AbstractSchemaManager;

class UtilityTasksCommand extends Command
{
    // the name of the command (the part after "bin/console")
    protected static $defaultName = 'app:run-command';
    private $entityManager;
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;

        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            // the short description shown while running "php bin/console list"
            ->setDescription('Runs a set of available commands.')
            ->setHelp('This command allows you to run the following commands \n 1. Delete orphan languages...')
            ->addOption('command', 'c', InputOption::VALUE_REQUIRED, 'The action to perform.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $success = true;
        switch ($input->getOption('command')) {
            case 'clean-translations':
                $success = $this->cleanTranslations($output);
                break;
            case 'locale-foreign-keys':
                $success = $this->updateLocaleFK($output);
                break;
            
            default:
                # code...
                break;
        }
        
        

        $output->writeln('Command completed '.(string)$success);

        return Command::SUCCESS;
    }

    /**
     * Removed orphaned translations that may exist in the database
     */
    protected function cleanTranslations(OutputInterface $output) : bool
    {
        $output->writeln([
            'Cleaning translations from deleted languages',
            '============',
            '',
        ]);

        try {
            //Get schema manager
            $sm = $this->entityManager->getConnection()->getSchemaManager();
            //Get all databases and without system tables. The list is from mysql, more databases to be added.
            $databases = $this->getDatabases($sm);

            //For each database, we need to search for locales not in language DB
            foreach($databases as $database)
            {
                $tables = $sm->listTableNames($database);
                //Let's get sequences
                foreach ($tables as $table) {
                    //If it's not a table that contains translations, please skip
                    if(!str_contains($table,'translation'))
                        continue;

                    $output->writeln('Current table is: '.$table);

                    $dq = "DELETE FROM ".$table." WHERE locale NOT IN (SELECT code FROM language)";
                    $query =$this->entityManager->getConnection()->prepare($dq);
                    $result = $query->execute();
                }
            }
            return true;
        } catch (\Throwable $th) {
            $output->writeln(['An error occured while clearing translations', 'Message: '.$th->getMessage(), 'Line: '.$th->getLine(), 'Complete dump: '.$th->__toString()]);
            return false;
        }
        
    }

    /**
     * Updates translation tables to add relationship between language code and locale
     * so that on-removal of languages, translations that are no-longer required may be 
     * removed.
     * 
     */
    protected function updateLocaleFK(OutputInterface $output)
    {
        $output->writeln([
            'Updating foreign keys in tranlsation tables',
            '============',
            '',
        ]);
        $sm = $this->entityManager->getConnection()->getSchemaManager();
        $databases = $this->getDatabases($sm);
        try {
            //For each database, we need to search for locales not in language DB
            foreach($databases as $database)
            {
                $tables = $sm->listTableNames($database);
                //Let's get sequences
                foreach ($tables as $table) {
                    //If it's not a table that contains translations, please skip
                    if(!str_contains($table,'translation'))
                        continue;

                    $output->writeln('Current table is: '.$table);
                    $fk = $this->generateIdentifierName(array($table,'locale'), 'FK');
                    $foreignKeys = $sm->listTableForeignKeys($table);
                    if(count(array_filter(
                        $foreignKeys,
                        function ($e) use (&$fk) {
                            return $e->getName() == $fk;
                        }
                    )) == 0)
                    {
                        $dq = "ALTER TABLE ".$table." ADD CONSTRAINT ".$fk." FOREIGN KEY (locale) REFERENCES language (code) ON DELETE CASCADE;";
                        $query =$this->entityManager->getConnection()->prepare($dq);
                        $result = $query->execute();
                    }
                }
            }
            return true;
        } catch (\Throwable $th) {
            $output->writeln(['An error occured while clearing translations', 'Message: '.$th->getMessage(), 'Line: '.$th->getLine(), 'Complete dump: '.$th->__toString()]);
            return false;
        }
    }

    /*
    Returns all databases in the connection provided
    */
    protected function getDatabases(AbstractSchemaManager $sm) : array
    {
        return array_filter($sm->listDatabases(), function($arr) 
        {
            return $arr != "performance_schema" && $arr != "information_schema" && $arr != "sys" && $arr != "mysql" && $arr != "pg_catalog";
        }
        );
    }

    /**
     *     Generates foreign-key IDs in the format doctrine uses when managing keys and indexes
     *     Source: https://gist.github.com/ji-zhou-ca/418b58ff7fc1520994dc
     */
    protected function generateIdentifierName($tableAndColumnNames, $prefix='', $maxSize=30)
    {
        $hash = implode("", array_map(function($column) {
            return dechex(crc32($column));
        }, $tableAndColumnNames));
    
        return substr(strtoupper($prefix . "_" . $hash), 0, $maxSize);
    }
}