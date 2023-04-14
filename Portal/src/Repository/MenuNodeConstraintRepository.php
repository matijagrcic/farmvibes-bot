<?php

namespace App\Repository;

use App\Entity\MenuNodeConstraint;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method MenuNodeConstraint|null find($id, $lockMode = null, $lockVersion = null)
 * @method MenuNodeConstraint|null findOneBy(array $criteria, array $orderBy = null)
 * @method MenuNodeConstraint[]    findAll()
 * @method MenuNodeConstraint[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MenuNodeConstraintRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MenuNodeConstraint::class);
    }

    // /**
    //  * @return MenuNodeConstraint[] Returns an array of MenuNodeConstraint objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('m.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?MenuNodeConstraint
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
