<?php
 
namespace App\Controller;
 
use App\Entity\MenuNode;
use App\Entity\Menu;
use App\Entity\MenuNodeType;
use App\Dto\MenuNodeInput;
use App\Entity\Content;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;
 
/**
 * This controller class provides API endpoint to write menu node data.
 */
#[AsController]
class NodePersist extends AbstractController
{
    /**
     * @var SerializerInterface $serializer
     */
    private $serializer;
    /**
     * @param SerializerInterface $serializer
     */

    private $doctrine;
    public function __construct(SerializerInterface $serializer, PersistenceManagerRegistry $doctrine) {
        $this->serializer = $serializer;
        $this->doctrine = $doctrine;
    }

    public function __invoke(Request $request)
    {
        $em = $this->doctrine->getManager();
        $content = $this->serializer->deserialize(json_encode(json_decode($request->getContent(),true)['contentObj']), Content::class, 'json');  
        $menuNode = $this->serializer->deserialize($request->getContent(), MenuNode::class, 'json');
        $menuNode->setContent($content);   
        $em->persist($menuNode);
        $em->flush();
        
        $response = new JsonResponse(['status' => 201, 'content' => 'menu persisted']);
        return $response;
    }
}