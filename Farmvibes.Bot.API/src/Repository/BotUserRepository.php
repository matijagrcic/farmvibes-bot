<?php

namespace App\Repository;

use App\Entity\BotUser;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method BotUser|null find($id, $lockMode = null, $lockVersion = null)
 * @method BotUser|null findOneBy(array $criteria, array $orderBy = null)
 * @method BotUser[]    findAll()
 * @method BotUser[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BotUserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BotUser::class);
    }

    // /**
    //  * @return BotUser[] Returns an array of BotUser objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('b.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?BotUser
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
