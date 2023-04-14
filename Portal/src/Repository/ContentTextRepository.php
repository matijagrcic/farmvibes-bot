<?php

namespace App\Repository;

use App\Entity\ContentText;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method ContentText|null find($id, $lockMode = null, $lockVersion = null)
 * @method ContentText|null findOneBy(array $criteria, array $orderBy = null)
 * @method ContentText[]    findAll()
 * @method ContentText[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ContentTextRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContentText::class);
    }

    // /**
    //  * @return ContentText[] Returns an array of ContentText objects
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
    public function findOneBySomeField($value): ?ContentText
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
