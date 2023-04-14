<?php

namespace App\Repository;

use App\Entity\QuestionValidation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method QuestionValidation|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionValidation|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionValidation[]    findAll()
 * @method QuestionValidation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionValidationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionValidation::class);
    }

    // /**
    //  * @return QuestionValidation[] Returns an array of QuestionValidation objects
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
    public function findOneBySomeField($value): ?QuestionValidation
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
