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
use App\Repository\QuestionTypeRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['questionType:read']], denormalizationContext: ['groups' => ['questionType:write']], filters: ['translation.groups'])]
#[ORM\Entity(repositoryClass: QuestionTypeRepository::class)]
#[ORM\HasLifecycleCallbacks]
class QuestionType extends AbstractTranslatable
{

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['translations'])]
    private $id;

    #[Groups(['question:read', 'service:read', 'questionType:read'])]
    protected $name;

    #[Groups(['question:read', 'service:read', 'questionType:read'])]
    protected $description;


    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['questionType:read', 'questionType:write', 'question:read', 'service:read'])]
    private ?bool $isPublished = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['questionType:read', 'question:read', 'service:read'])]
    private $createdAt;


    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['questionType:read', 'question:read', 'service:read'])]
    private $updatedAt;

    #[ORM\Column(type: Types::STRING, length: 255, nullable: true)]
    #[Groups(['questionType:read', 'questionType:write', 'question:read', 'service:read'])]
    private ?string $icon = null;

    #[ORM\Column(type: Types::BOOLEAN, nullable: true)]
    #[Groups(['questionType:read', 'questionType:write', 'question:read', 'service:read'])]
    private ?bool $hasOptions = false;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionTypeTranslation>|\App\Entity\QuestionTypeTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionTypeTranslation::class, mappedBy: 'translatable', fetch: 'EAGER', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['translations', 'questionType:write'])]
    protected Collection $translations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionTypeAttribute>
     */
    #[ORM\ManyToMany(targetEntity: QuestionTypeAttribute::class, mappedBy: 'questionType')]
    #[Groups(['questionType:read', 'questionType:write', 'service:read', 'question:read', 'service:read'])]
    private Collection $attributes;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Validation>
     */
    #[ORM\ManyToMany(targetEntity: Validation::class, mappedBy: 'questionTypes')]
    #[Groups(['questionType:read', 'questionType:write', 'service:read'])]
    private Collection $validations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Question>
     */
    #[ORM\OneToMany(targetEntity: Question::class, mappedBy: 'questionType', orphanRemoval: true)]
    private Collection $questions;

    public $timezone = 'Africa/Nairobi';

    public function __construct()
    {
        parent::__construct();

        $this->translations = new ArrayCollection();
        $this->attributes = new ArrayCollection();
        $this->validations = new ArrayCollection();
        $this->questions = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    public function setName(string $name) : self
    {
        return $this->getTranslation()->setName($name);
    }
    public function getDescription() : ?string
    {
        return $this->getTranslation()->getDescription();
    }
    public function setDescription(string $description) : self
    {
        return $this->getTranslation()->setDescription($description);
    }
    public function getIsPublished() : ?bool
    {
        return $this->isPublished;
    }
    public function setIsPublished(bool $isPublished) : self
    {
        $this->isPublished = $isPublished;
        return $this;
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
    public function getIcon() : ?string
    {
        return $this->icon;
    }
    public function setIcon(?string $icon) : self
    {
        $this->icon = $icon;
        return $this;
    }
    public function getHasOptions() : ?bool
    {
        return $this->hasOptions;
    }
    public function setHasOptions(?bool $hasOptions) : self
    {
        $this->hasOptions = $hasOptions;
        return $this;
    }
    public function __toString()
    {
        return $this->getName() === null ? "New" : $this->getName();
    }
    /**
     * @return Collection|QuestionTypeAttribute[]
     */
    public function getAttributes() : Collection
    {
        return $this->attributes;
    }
    public function addAttribute(QuestionTypeAttribute $attribute) : self
    {
        if (!$this->attributes->contains($attribute)) {
            $this->attributes[] = $attribute;
            $attribute->addQuestionType($this);
        }
        return $this;
    }
    public function removeAttribute(QuestionTypeAttribute $attribute) : self
    {
        if ($this->attributes->removeElement($attribute)) {
            $attribute->removeQuestionType($this);
        }
        return $this;
    }
    /**
     * @return Collection|Validation[]
     */
    public function getValidations() : Collection
    {
        return $this->validations;
    }
    public function addValidation(Validation $validation) : self
    {
        if (!$this->validations->contains($validation)) {
            $this->validations[] = $validation;
            $validation->addQuestionType($this);
        }
        return $this;
    }
    public function removeValidation(Validation $validation) : self
    {
        if ($this->validations->removeElement($validation)) {
            $validation->removeQuestionType($this);
        }
        return $this;
    }
    /**
     * @return Collection|Question[]
     */
    public function getQuestions() : Collection
    {
        return $this->questions;
    }
    public function addQuestion(Question $question) : self
    {
        if (!$this->questions->contains($question)) {
            $this->questions[] = $question;
            $question->setQuestionType($this);
        }
        return $this;
    }
    public function removeQuestion(Question $question) : self
    {
        if ($this->questions->removeElement($question)) {
            // set the owning side to null (unless already changed)
            if ($question->getQuestionType() === $this) {
                $question->setQuestionType(null);
            }
        }
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new QuestionTypeTranslation();
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->createdAt = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PreUpdate]
    public function beforeUpdate()
    {
        $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
    }
}
