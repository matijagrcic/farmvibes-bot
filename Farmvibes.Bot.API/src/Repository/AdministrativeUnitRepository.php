<?php

namespace App\Repository;

use App\Entity\AdministrativeUnit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method AdministrativeUnit|null find($id, $lockMode = null, $lockVersion = null)
 * @method AdministrativeUnit|null findOneBy(array $criteria, array $orderBy = null)
 * @method AdministrativeUnit[]    findAll()
 * @method AdministrativeUnit[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AdministrativeUnitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AdministrativeUnit::class);
    }

    // /**
    //  * @return AdministrativeUnit[] Returns an array of AdministrativeUnit objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('a.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?AdministrativeUnit
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
