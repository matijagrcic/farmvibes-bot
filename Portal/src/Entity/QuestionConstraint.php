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
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;

#[ApiResource(normalizationContext: ['groups' => ['questionConstraint:read']], denormalizationContext: ['groups' => ['questionConstraint:write']])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class QuestionConstraint
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['questionConstraint:read', 'question:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questionConstraint:write'])]
    private ?\App\Entity\Question $question = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'question')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questionConstraint:read', 'question:read', 'questionConstraint:write', 'question:write'])]
    private ?\App\Entity\Constraint $constaintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['questionConstraint:read', 'question:read', 'questionConstraint:write', 'question:write'])]
    private $filters = [];
    
    public function getId() : ?int
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
    public function getConstaintItem() : ?Constraint
    {
        return $this->constaintItem;
    }
    public function setConstaintItem(?Constraint $constaintItem) : self
    {
        $this->constaintItem = $constaintItem;
        return $this;
    }
    public function getFilters() : ?array
    {
        return $this->filters;
    }
    public function setFilters(array $filters) : self
    {
        $this->filters = $filters;
        return $this;
    }
    public function __toString()
    {
        return $this->getFilters() === null ? "New" : $this->getFilters();
    }
}
