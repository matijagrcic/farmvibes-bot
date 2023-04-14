<?php

namespace App\Entity;

use App\Repository\ServiceConstraintRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ServiceConstraintRepository::class)]
class ServiceConstraint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['service:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Service::class, inversedBy: 'serviceConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Service $service = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'serviceConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['service:write', 'service:read'])]
    private ?\App\Entity\Constraint $constaintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['service:write', 'service:read'])]
    private $filters = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(?Service $service): self
    {
        $this->service = $service;

        return $this;
    }

    public function getConstaintItem(): ?Constraint
    {
        return $this->constaintItem;
    }

    public function setConstaintItem(?Constraint $constaintItem): self
    {
        $this->constaintItem = $constaintItem;

        return $this;
    }

    public function getFilters(): ?array
    {
        return $this->filters;
    }

    public function setFilters(array $filters): self
    {
        $this->filters = $filters;

        return $this;
    }
}
