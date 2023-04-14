<?php
 
namespace App\Controller;
 
use App\Entity\MenuNode;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;
 
/**
 * This controller class provides endpoint for getting menu node content.
 */
#[AsController]
class MenuForBot extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    public function __invoke(string $menu)
    {
        $repo = $this->doctrine
            ->getRepository(MenuNode::class);
            
        $query = $this->doctrine->getManager()
            ->createQueryBuilder()
            ->select('tree,nodetype')
            ->from('App\Entity\MenuNode', 'tree')
            ->join('tree.type','nodetype')
            ->orderBy('tree.root, tree.lft', 'ASC')
            ->where('tree.root = :menuId')
            ->setParameter('menuId',$menu)
            ->getQuery()
        ;

        $tree = $repo->buildTree($query->getArrayResult())[0];

        //Change labels
        $tree = $this->arrayReplace($tree,'type');

        //Change type
        $tree = $this->arrayReplace($tree,'label');

        return $tree;
    }
    
    /**
     * arrayReplace
     *
     * @param  mixed $array
     * @param  mixed $find
     * @return void
     */
    function arrayReplace($array, $find){
        if(is_array($array)){
            foreach($array as $key=>$val) {
                if(is_array($array[$key])){
                    if($key == $find && array_key_exists('name',$array[$key]))
                    {   
                        $array[$key] = $array[$key]['name'];
                    }
                    $array[$key] = $this->arrayReplace($array[$key], $find);
                }else{
                if($key == $find) {
                    if($find == 'label')
                     {   
                        $array['labels'] = ['en' => $array['label']];
                     }
                }
                if(in_array($key,["createdAt", "updatedAt", "lft", "lvl", "rgt"]))
                    unset($array[$key]);
            }
        }
        }
        return $array;
      }
}