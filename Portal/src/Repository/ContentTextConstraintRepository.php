<?php

namespace App\Repository;

use App\Entity\ContentTextConstraint;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ContentTextConstraint|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContentTextConstraint|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContentTextConstraint[]    findAll()
 * @method ContentTextConstraint[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentTextConstraintRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContentTextConstraint::class);
    }

    // /**
    //  * @return ContentTextConstraint[] Returns an array of ContentTextConstraint objects
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
    public function findOneBySomeField($value): ?ContentTextConstraint
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
