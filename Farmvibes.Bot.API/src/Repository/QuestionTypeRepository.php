<?php

namespace App\Repository;

use App\Entity\QuestionType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method QuestionType|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionType|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionType[]    findAll()
 * @method QuestionType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionType::class);
    }

    // /**
    //  * @return QuestionType[] Returns an array of QuestionType objects
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
    public function findOneBySomeField($value): ?QuestionType
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
