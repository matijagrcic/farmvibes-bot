<?php

namespace App\Repository;

use App\Entity\QuestionConstraint;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method QuestionConstraint|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionConstraint|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionConstraint[]    findAll()
 * @method QuestionConstraint[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionConstraintRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionConstraint::class);
    }

    // /**
    //  * @return QuestionConstraint[] Returns an array of QuestionConstraint objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('q.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?QuestionConstraint
    {
        return $this->createQueryBuilder('q')
            ->andWhere('q.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
