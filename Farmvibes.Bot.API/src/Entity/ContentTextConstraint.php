<?php

namespace App\Entity;

use App\Repository\ContentTextConstraintRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContentTextConstraintRepository::class)]
class ContentTextConstraint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ContentText::class, inversedBy: 'contentTextConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\ContentText $text = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'contentTextConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    private $filters = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getText(): ?ContentText
    {
        return $this->text;
    }

    public function setText(?ContentText $text): self
    {
        $this->text = $text;

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
