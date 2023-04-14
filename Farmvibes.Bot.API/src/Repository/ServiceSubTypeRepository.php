<?php

namespace App\Repository;

use App\Entity\ServiceSubType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ServiceSubType|null find($id, $lockMode = null, $lockVersion = null)
 * @method ServiceSubType|null findOneBy(array $criteria, array $orderBy = null)
 * @method ServiceSubType[]    findAll()
 * @method ServiceSubType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ServiceSubTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ServiceSubType::class);
    }

    // /**
    //  * @return ServiceSubType[] Returns an array of ServiceSubType objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('s.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ServiceSubType
    {
        return $this->createQueryBuilder('s')
            ->andWhere('s.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
