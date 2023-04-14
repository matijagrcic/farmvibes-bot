<?php

declare(strict_types=1);

namespace App\HttpCache;

use ApiPlatform\Core\HttpCache\PurgerInterface;


class VPurger implements PurgerInterface
{
    private PurgerInterface $decorated;    

    /**
     * @param PurgerInterface $decorated
     */
    public function __construct(PurgerInterface $decorated)
    {
        $this->decorated = $decorated;
    }

    public function purge(array $iris): void
    {
         $this->decorated->purge($iris);
    }
}