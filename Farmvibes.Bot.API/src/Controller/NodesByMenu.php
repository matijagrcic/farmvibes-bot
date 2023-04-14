<?php
 
namespace App\Controller;
 
use App\Entity\MenuNode;
use App\Entity\MenuNodeType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;

// This controller class provides API endpoint for getting menu nodes.
#[AsController]
class NodesByMenu extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    public function __invoke(string $root = null)
    {
        $repo = $this->doctrine
            ->getRepository(MenuNode::class);
        $repo->setChildrenIndex('children');
            
        $query = $this->doctrine->getManager()
            ->createQueryBuilder()
            ->select('tree, nodetype as type, translations', 'services', 'contents', 'constraints', 'menuConstraintItem')
            ->from(MenuNode::class, 'tree')
            ->join('tree.type','nodetype')
            ->leftJoin('tree.translations','translations')
            ->leftJoin('tree.constraints','constraints')
            ->leftJoin('constraints.constraintItem', 'menuConstraintItem')
            ->leftJoin('tree.service','services')
            ->leftJoin('tree.content','contents')
            ->orderBy('tree.root, tree.lft', 'ASC')
        ;

        if($root != 'full' && $root != null)
        {
            $query->where('tree.root = :root');
            $query->setParameter('root', $root);
        }
        else {
            $query->where('tree.type = :type');
            $query->setParameter('type', 1);
        }

        $tree = $repo->buildTree($query->getQuery()->getArrayResult()) ;

        return $tree;
    }
}