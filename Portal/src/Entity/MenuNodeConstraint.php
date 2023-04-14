<?php

namespace App\Entity;

use App\Repository\MenuNodeConstraintRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MenuNodeConstraintRepository::class)]
class MenuNodeConstraint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: MenuNode::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\MenuNode $node = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'menuNodeConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    private $filters = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNode(): ?MenuNode
    {
        return $this->node;
    }

    public function setNode(?MenuNode $node): self
    {
        $this->node = $node;

        return $this;
    }

    public function getConstraintItem(): ?Constraint
    {
        return $this->constraintItem;
    }

    public function setConstraintItem(?Constraint $constraintItem): self
    {
        $this->constraintItem = $constraintItem;

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
