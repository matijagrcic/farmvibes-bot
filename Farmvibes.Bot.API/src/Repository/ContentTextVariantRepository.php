<?php

namespace App\Repository;

use App\Entity\ContentTextVariant;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ContentTextVariant|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContentTextVariant|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContentTextVariant[]    findAll()
 * @method ContentTextVariant[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentTextVariantRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContentTextVariant::class);
    }

    // /**
    //  * @return ContentTextVariant[] Returns an array of ContentTextVariant objects
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
    public function findOneBySomeField($value): ?ContentTextVariant
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
