<?php

namespace App\Repository;

use App\Entity\QuestionTypeAttribute;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method QuestionTypeAttribute|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionTypeAttribute|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionTypeAttribute[]    findAll()
 * @method QuestionTypeAttribute[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionTypeAttributeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionTypeAttribute::class);
    }

    // /**
    //  * @return QuestionTypeAttribute[] Returns an array of QuestionTypeAttribute objects
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
    public function findOneBySomeField($value): ?QuestionTypeAttribute
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
