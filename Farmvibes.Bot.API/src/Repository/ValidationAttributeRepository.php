<?php

namespace App\Repository;

use App\Entity\ValidationAttribute;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ValidationAttribute|null find($id, $lockMode = null, $lockVersion = null)
 * @method ValidationAttribute|null findOneBy(array $criteria, array $orderBy = null)
 * @method ValidationAttribute[]    findAll()
 * @method ValidationAttribute[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ValidationAttributeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ValidationAttribute::class);
    }

    // /**
    //  * @return ValidationAttribute[] Returns an array of ValidationAttribute objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('v.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ValidationAttribute
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
