<?php

namespace App\Entity;

use App\Repository\MenuNodeConstraintRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Link;

#[ApiResource(operations: [new GetCollection(
    uriTemplate: '/menu_nodes/{nodeId}/constraints',
    uriVariables: [
        'nodeId' => new Link(
            fromClass: MenuNode::class,
            fromProperty: 'constraints'
        ),
    ]
), new Post()])]
#[ApiResource(operations: [new Get(
    uriTemplate: '/menu_nodes/{nodeId}/constraints/{id}',
    uriVariables: [
        'nodeId' => new Link(
            fromClass: MenuNode::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: MenuNodeConstraint::class
        )
    ],
)])]
#[ApiResource(operations: [new Delete(
    uriTemplate: '/menu_nodes/{nodeId}/constraints/{id}',
    uriVariables: [
        'nodeId' => new Link(
            fromClass: MenuNode::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: MenuNodeConstraint::class
        )
    ],
)])]
#[ApiResource(operations: [new Patch(
    uriTemplate: '/menu_nodes/{questionId}/constraints/{id}',
    uriVariables: [
        'nodeId' => new Link(
            fromClass: MenuNode::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: MenuNodeConstraint::class
        )
    ],
)])]
#[ORM\Entity(repositoryClass: MenuNodeConstraintRepository::class)]
class MenuNodeConstraint
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    private $id;

    #[ORM\ManyToOne(targetEntity: MenuNode::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?\App\Entity\MenuNode $node = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty(readableLink: true)]
    #[Groups(['menuNode:read', 'menuNode:write'])]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: Types::JSON)]
    private $filters = [];

    #[ORM\Column]
    private array $raw = [];

    public function getId(): ?string
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

    public function getRaw(): array
    {
        return $this->raw;
    }

    public function setRaw(array $raw): self
    {
        $this->raw = $raw;

        return $this;
    }
}
