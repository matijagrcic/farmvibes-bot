<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\AdminUser;
use Doctrine\ORM\EntityManagerInterface;

class AdminUserProvider implements ProviderInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $data = $this->em->getRepository(AdminUser::class)
            ->findOneBy(
                ['email' => $uriVariables['email']],
            );
 
        if (!$data) {
            throw $this->createNotFoundException(
                'No user found for this email'
            );
        }
        
        return $data;
    }
}
