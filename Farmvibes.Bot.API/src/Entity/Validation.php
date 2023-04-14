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
use App\Repository\ValidationRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Persistence\Event\LifecycleEventArgs;

#[ApiResource(normalizationContext: ['groups' => ['validation:read']], denormalizationContext: ['groups' => ['validation:write']], filters: ['translation.groups'])]
#[ORM\Entity(repositoryClass: ValidationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Validation extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['validation:read', 'questionType:read'])]
    private $id;
    
    #[Groups(['validation:read', 'onebot:read'])]
    protected $description;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionType>
     */
    #[ORM\ManyToMany(targetEntity: QuestionType::class, inversedBy: 'validations')]
    #[Groups(['validation:write', 'validation:read'])]
    private \Doctrine\Common\Collections\Collection $questionTypes;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['validation:read'])]
    private $createdAt;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['validation:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ValidationTranslation>|\App\Entity\ValidationTranslation[]
     */
    #[ORM\OneToMany(targetEntity: ValidationTranslation::class, mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['validation:write', 'translations'])]
    protected Collection $translations;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ValidationAttribute>
     */
    #[ORM\ManyToMany(targetEntity: ValidationAttribute::class, mappedBy: 'validation')]
    #[Groups(['questionType:read', 'validation:read', 'onebot:read'])]
    private \Doctrine\Common\Collections\Collection $validationAttributes;
    
    private $timezone = 'Africa/Nairobi';
    
    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->questionTypes = new ArrayCollection();
        $this->validationAttributes = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getDescription() : ?string
    {
        return $this->getTranslation()->getDescription();
    }
    public function setDescription(string $description) : void
    {
        $this->getTranslation()->setDescription($description);
    }
    /**
     * @return Collection|QuestionType[]
     */
    public function getQuestionTypes() : Collection
    {
        return $this->questionTypes;
    }
    public function addQuestionType(QuestionType $questionType) : self
    {
        if (!$this->questionTypes->contains($questionType)) {
            $this->questionTypes[] = $questionType;
        }
        return $this;
    }
    public function removeQuestionType(QuestionType $questionType) : self
    {
        $this->questionTypes->removeElement($questionType);
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
    public function __toString()
    {
        return $this->getDescription() === null ? "New" : $this->getDescription();
    }
    /**
     * @return Collection|ValidationAttribute[]
     */
    public function getValidationAttributes() : Collection
    {
        return $this->validationAttributes;
    }
    public function addValidationAttribute(ValidationAttribute $validationAttribute) : self
    {
        if (!$this->validationAttributes->contains($validationAttribute)) {
            $this->validationAttributes[] = $validationAttribute;
            $validationAttribute->addValidation($this);
        }
        return $this;
    }
    public function removeValidationAttribute(ValidationAttribute $validationAttribute) : self
    {
        if ($this->validationAttributes->removeElement($validationAttribute)) {
            $validationAttribute->removeValidation($this);
        }
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ValidationTranslation();
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave(LifecycleEventArgs $event)
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
