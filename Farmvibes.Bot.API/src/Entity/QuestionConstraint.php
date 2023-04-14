<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\QuestionConstraintRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use ApiPlatform\Metadata\Link;

#[ApiResource(operations:[new GetCollection(
    uriTemplate: '/questions/{questionId}/constraints', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'constraints'
        ),
    ]
    ), new Post()])]
#[ApiResource(operations:[new Get(
    uriTemplate: '/questions/{questionId}/constraints/{id}', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: QuestionConstraint::class
        )
    ],
    )])]
#[ApiResource(operations:[new Delete(
    uriTemplate: '/questions/{questionId}/constraints/{id}', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: QuestionConstraint::class
        )
    ],
    )])]
#[ApiResource(operations:[new Patch(
    uriTemplate: '/questions/{questionId}/constraints/{id}', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'constraints'
        ),
        'id' => new Link(
            fromClass: QuestionConstraint::class
        )
    ],
    )])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class QuestionConstraint
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['questionConstraint:read', 'question:read'])]
    private $id;

    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['question:write'])]
    private ?\App\Entity\Question $question = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questionConstraint:read', 'question:read', 'question:write'])]
    #[ApiProperty(readableLink: true)]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: Types::JSON)]
    #[Groups(['questionConstraint:read', 'question:read', 'questionConstraint:write', 'question:write'])]
    private array $raw = [];

    #[ORM\Column(type: Types::SIMPLE_ARRAY)]
    #[Groups(['questionConstraint:read', 'question:read', 'questionConstraint:write', 'question:write'])]
    private array $filters = [];
    
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getQuestion() : ?Question
    {
        return $this->question;
    }
    public function setQuestion(?Question $question) : self
    {
        $this->question = $question;
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
    
    public function __toString()
    {
        return $this->getFilters() === null ? "New" : $this->getFilters();
    }

    public function getRaw(): array
    {
        return $this->raw;
    }

    public function setRaw(?array $raw): self
    {
        $this->raw = $raw;

        return $this;
    }

    public function getFilters(): array
    {
        return $this->filters;
    }

    public function setFilters(array $filters): self
    {
        $this->filters = $filters;

        return $this;
    }
}
