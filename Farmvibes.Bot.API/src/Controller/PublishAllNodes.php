<?php
 
namespace App\Controller;
 
use App\Entity\MenuNode;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;

/**
 *This controller class provides an endpoint for pushing menu child nodes.
 */
#[AsController]
class PublishAllNodes extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    /*
    User has requested to publish all child nodes
    */
    public function __invoke(Request $request, PersistenceManagerRegistry $doctrine)
    {
        $em = $this->doctrine->getManager();

        $info = json_decode($request->getContent(),true);

        if($info['publish'] == 'all')
            $modifider = 'm.root = \''.$info['node'].'\'';
        else
            $modifider = 'm.id = \''.$info['node'].'\'';
        
        $status = $info['isPublished'] ? 1 : 0;
        $sql = 'update App\Entity\MenuNode m set m.isPublished = '.$status.' where '.$modifider;
        $q = $em->createQuery($sql);
        $numUpdated = $q->execute();

        return ['updatedNodes' => $numUpdated];
    }
}