<?php

namespace App\Repository;

use App\Entity\ContentConstraint;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ContentConstraint|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContentConstraint|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContentConstraint[]    findAll()
 * @method ContentConstraint[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentConstraintRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContentConstraint::class);
    }

    // /**
    //  * @return ContentConstraint[] Returns an array of ContentConstraint objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ContentConstraint
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
