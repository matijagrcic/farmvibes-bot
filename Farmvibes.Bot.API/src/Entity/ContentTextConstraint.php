<?php

namespace App\Entity;

use App\Repository\ContentTextConstraintRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ORM\Entity(repositoryClass: ContentTextConstraintRepository::class)]
class ContentTextConstraint
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    private $id;

    #[ORM\ManyToOne(targetEntity: ContentText::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\ContentText $text = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['content:write', 'content:read', 'onebot:read'])]
    private $filters = [];

    public function getId(): ?string
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
