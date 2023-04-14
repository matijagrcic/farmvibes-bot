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
use ApiPlatform\Doctrine\Orm\Filter\ExistsFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\QuestionRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Component\Serializer\Annotation\MaxDepth;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use ApiPlatform\Metadata\Link;
use Doctrine\DBAL\Types\Types;

#[ApiResource(operations: [new Post(denormalizationContext: ['groups' => ['question:write']],
normalizationContext: ['groups' => ['uxQuestionRequest:read','translations','uxPersonalisation:read']])])]
#[ApiResource(uriTemplate: '/services/{serviceId}/questions', 
    uriVariables: [
        'serviceId' => new Link(
            fromClass: Service::class,
            fromProperty: 'questions'
        )
    ],
    order: ['position' => 'ASC'],
    operations: [new GetCollection()],
    filters: ['translation.groups'])
]
#[ApiResource(uriTemplate: '/services/{serviceId}/questions/{id}', 
    uriVariables: [
        'serviceId' => new Link(
            fromClass: Service::class,
            fromProperty: 'questions'
        ),
        'id' => new Link(
            fromClass: Question::class
        )
    ],
    operations: [new Get()])
]
#[ApiResource(uriTemplate: '/services/{serviceId}/question', 
    uriVariables: [
        'serviceId' => new Link(
            fromClass: Service::class,
            fromProperty: 'questions'
        )
    ],
    operations: [new Post()],
    denormalizationContext: ['groups' => ['question:write']])
]
#[ApiResource(uriTemplate: '/services/{serviceId}/question/{id}', 
    uriVariables: [
        'serviceId' => new Link(
            fromClass: Service::class,
            fromProperty: 'questions'
        ),
        'id' => new Link(
            fromClass: Question::class
        )
    ],
    operations: [new Patch()],
    normalizationContext: ['groups' => ['uxQuestionRequest:read','translations']],
    denormalizationContext: ['groups' => ['question:write']])
    
]
#[ApiResource(uriTemplate: '/services/{serviceId}/question/{id}', 
    uriVariables: [
        'serviceId' => new Link(
            fromClass: Service::class,
            fromProperty: 'questions'
        ),
        'id' => new Link(
            fromClass: Question::class
        )
    ],
    operations: [new Delete()])
]
#[ApiFilter(ExistsFilter::class, properties: ['questionOptions'])]
#[ORM\Entity(repositoryClass: QuestionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Question extends AbstractTranslatable
{
    #[ORM\Column(type: Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['question:read','uxQuestionRequest:read', 'service:read','uxPersonalisation:read', 'onebot:read', 'uxConstraints:read'])]
    private $id = null;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:write', 'service:read','uxPersonalisation:read', 'onebot:read', 'uxConstraints:read'])]
    private ?string $description = null;

    #[Groups(['question:read', 'service:read'])]
    private $hint;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['question:read','uxQuestionRequest:read'])]
    private $createdAt;

    #[Groups(['translations'])]
    protected $question;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['question:read','uxQuestionRequest:read'])]
    private $updatedAt;

    #[ORM\ManyToOne(targetEntity: QuestionType::class, inversedBy: 'questions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['question:read', 'question:write', 'service:read', 'service:write','uxQuestionRequest:read', 'onebot:read'])]
    private ?\App\Entity\QuestionType $questionType = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Media>
     */
    #[ORM\ManyToMany(targetEntity: Media::class, inversedBy: 'questions', cascade: ['PERSIST','REMOVE'])]
    #[Groups(['question:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]
    private Collection $media;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionOption>
     */
    #[ORM\OneToMany(targetEntity: QuestionOption::class, mappedBy: 'question', cascade: ['PERSIST','REMOVE'], orphanRemoval: true)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]
    #[ApiProperty(writableLink: true)]
    #[Link(toProperty: 'questionOptions')]
    private Collection $questionOptions;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionTranslation>|\App\Entity\QuestionTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionTranslation::class, mappedBy: 'translatable', indexBy: 'locale', cascade: ['PERSIST','REMOVE'], orphanRemoval: true)]
    #[Groups(['question:write', 'translations', 'service:write'])]
    protected Collection $translations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionValidation>
     */
    #[ORM\OneToMany(targetEntity: QuestionValidation::class, mappedBy: 'question', cascade: ['PERSIST','REMOVE'])]
    #[Groups(['question:read', 'question:write', 'service:write', 'service:read', 'onebot:read'])]
    private Collection $questionValidations;

    #[ORM\ManyToOne(targetEntity: Service::class, inversedBy: 'questions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['question:write'])]
    private ?\App\Entity\Service $service = null;

    #[ORM\Column(type: Types::ARRAY, nullable: true)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]

    private $attributes = [];

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: Types::INTEGER, nullable: true)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]
    private ?int $position = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]

    private ?bool $isPublished = false;

    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]

    private ?bool $isSystem = false;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['question:read','uxQuestionRequest:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]
    private $contentLookUp = null;

    #[ORM\ManyToOne(targetEntity: QuestionTag::class, inversedBy: 'questions')]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['question:read', 'question:write', 'service:read', 'service:write', 'onebot:read'])]
    private $questionTag;

    #[ORM\OneToMany(mappedBy: 'question', targetEntity: QuestionConstraint::class, cascade: ['PERSIST','REMOVE'], orphanRemoval: true)]
    #[Groups(['question:read', 'question:write', 'service:write', 'service:read', 'onebot:read'])]
    #[Link(toProperty: 'constraints')]
    private Collection $constraints;

    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->media = new ArrayCollection();
        $this->questionOptions = new ArrayCollection();
        $this->questionValidations = new ArrayCollection();
        $this->constraints = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getQuestion() : ?string
    {
        return $this->getTranslation()->getQuestion();
    }
    public function setQuestion(string $question) : self
    {
        return $this->getTranslation()->setQuestion($question);
    }
    public function getDescription() : ?string
    {
        return $this->description;
    }
    public function setDescription(string $description) : self
    {
        $this->description = $description;
        return $this;
    }
    public function getHint() : ?string
    {
        return $this->getTranslation()->getHint();
    }
    public function setHint(?string $hint) : self
    {
        return $this->getTranslation()->setDesetHintscription($hint);
    }
    public function getCreatedAt() : ?\DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function setCreatedAt(\DateTimeImmutable $createdAt) : self
    {
        $this->createdAt = $createdAt;
        return $this;
    }
    public function getUpdatedAt() : ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt) : self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
    public function getQuestionType() : ?QuestionType
    {
        return $this->questionType;
    }
    public function setQuestionType(?QuestionType $questionType) : self
    {
        $this->questionType = $questionType;
        return $this;
    }
    /**
     * @return Collection|Media[]
     */
    public function getMedia() : Collection
    {
        return $this->media;
    }
    public function addMedium(Media $medium) : self
    {
        if (!$this->media->contains($medium)) {
            $this->media[] = $medium;
        }
        return $this;
    }
    public function removeMedium(Media $medium) : self
    {
        $this->media->removeElement($medium);
        return $this;
    }
    /**
     * @return Collection|QuestionOption[]
     */
    public function getQuestionOptions() : Collection
    {
        return $this->questionOptions;
    }
    public function addQuestionOption(QuestionOption $questionOption) : self
    {
        if (!$this->questionOptions->contains($questionOption)) {
            $this->questionOptions[] = $questionOption;
            $questionOption->setQuestion($this);
        }
        return $this;
    }
    public function removeQuestionOption(QuestionOption $questionOption) : self
    {
        if ($this->questionOptions->removeElement($questionOption)) {
            // set the owning side to null (unless already changed)
            if ($questionOption->getQuestion() === $this) {
                $questionOption->setQuestion(null);
            }
        }
        return $this;
    }
    public function __toString()
    {
        return $this->getQuestion() === null ? "New" : $this->getQuestion();
    }
    /**
     * @return Collection|QuestionValidation[]
     */
    public function getQuestionValidations() : Collection
    {
        return $this->questionValidations;
    }
    public function addQuestionValidation(QuestionValidation $questionValidation) : self
    {
        if (!$this->questionValidations->contains($questionValidation)) {
            $this->questionValidations[] = $questionValidation;
            $questionValidation->setQuestion($this);
        }
        return $this;
    }
    public function removeQuestionValidation(QuestionValidation $questionValidation) : self
    {
        if ($this->questionValidations->removeElement($questionValidation)) {
            // set the owning side to null (unless already changed)
            if ($questionValidation->getQuestion() === $this) {
                $questionValidation->setQuestion(null);
            }
        }
        return $this;
    }
    public function getService() : ?Service
    {
        return $this->service;
    }
    public function setService(?Service $service) : self
    {
        $this->service = $service;
        return $this;
    }

    public function getQuestionTag(): ?QuestionTag
    {
        return $this->questionTag;
    }

    public function setQuestionTag(?QuestionTag $questionTag): self
    {
        $this->questionTag = $questionTag;

        return $this;
    }

    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeUpdate()
    {
        $this->setUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    protected function createTranslation() : TranslationInterface
    {
        return new QuestionTranslation();
    }
    public function getAttributes() : ?array
    {
        return $this->attributes;
    }
    public function setAttributes(?array $attributes) : self
    {
        $this->attributes = $attributes;
        return $this;
    }
    public function getPosition() : ?int
    {
        return $this->position;
    }
    public function setPosition(?int $position) : self
    {
        $this->position = $position;
        return $this;
    }
    public function getIsPublished() : ?bool
    {
        return $this->isPublished;
    }
    public function setIsPublished(?bool $isPublished) : self
    {
        $this->isPublished = $isPublished;
        return $this;
    }
    public function getIsSystem() : ?bool
    {
        return $this->isSystem;
    }
    public function setIsSystem(?bool $isSystem) : self
    {
        $this->isSystem = $isSystem;
        return $this;
    }
    public function getContentLookUp() : ?array
    {
        return $this->contentLookUp;
    }
    public function setContentLookUp(?array $contentLookUp) : self
    {
        $this->contentLookUp = $contentLookUp;
        return $this;
    }

    /**
     * @return Collection<int, QuestionConstraint>
     */
    public function getConstraints(): Collection
    {
        return $this->constraints;
    }

    public function addConstraint(QuestionConstraint $constraint): self
    {
        if (!$this->constraints->contains($constraint)) {
            $this->constraints->add($constraint);
            $constraint->setQuestion($this);
        }

        return $this;
    }

    public function removeConstraint(QuestionConstraint $constraint): self
    {
        if ($this->constraints->removeElement($constraint)) {
            // set the owning side to null (unless already changed)
            if ($constraint->getQuestion() === $this) {
                $constraint->setQuestion(null);
            }
        }

        return $this;
    }
}
