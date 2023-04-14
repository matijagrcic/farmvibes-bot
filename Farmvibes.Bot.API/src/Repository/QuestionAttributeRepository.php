<?php

namespace App\Repository;

use App\Entity\QuestionAttribute;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method QuestionAttribute|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionAttribute|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionAttribute[]    findAll()
 * @method QuestionAttribute[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionAttributeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionAttribute::class);
    }

    // /**
    //  * @return QuestionAttribute[] Returns an array of QuestionAttribute objects
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
    public function findOneBySomeField($value): ?QuestionAttribute
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
