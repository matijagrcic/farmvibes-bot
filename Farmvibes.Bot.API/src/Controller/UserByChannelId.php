<?php
 
namespace App\Controller;
 
use App\Entity\BotUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Doctrine\Persistence\ManagerRegistry as PersistenceManagerRegistry;
 
/**
 * This controller provides an API endpoint for querying a user using the using channel identifier as the endpoint parameter argument.
 */
#[AsController]
class UserByChannelId extends AbstractController
{
    private $doctrine;

    public function __construct(PersistenceManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }
    public function __invoke(string $channelId)
    {
        $user = $this->doctrine->getManager()
            ->createQueryBuilder()
            ->select('u')
            ->from(BotUser::class,'u')
            ->join('u.botUserContacts','c')
            ->where(
                'c.value = :id',
            )->setParameter('id',$channelId)->setMaxResults(1)->getQuery()->getOneOrNullResult();
 
        if (!$user) {
            $user = null;
        }
 
        return $user;
    }
}