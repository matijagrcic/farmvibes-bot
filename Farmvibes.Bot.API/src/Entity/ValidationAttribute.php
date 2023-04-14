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
use App\Repository\ValidationAttributeRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Persistence\Event\LifecycleEventArgs;

#[ApiResource(normalizationContext: ['groups' => ['validationAttribute:read']], denormalizationContext: ['groups' => ['validationAttribute:write']], filters: ['translation.groups'])]
#[ORM\Entity(repositoryClass: ValidationAttributeRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ValidationAttribute extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['validation:read', 'validationAttribute:read', 'questionType:read', 'service:read','questionValidation:read'])]
    private $id;
    
    #[Groups(['validationAttribute:read', 'onebot:read', 'questionType:read'])]
    protected $description;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Validation>
     */
    #[ORM\ManyToMany(targetEntity: Validation::class, inversedBy: 'validationAttributes')]
    #[Groups(['validationAttribute:write'])]
    private \Doctrine\Common\Collections\Collection $validation;
    
    #[Groups(['validation:read', 'validationAttribute:read', 'onebot:read'])]
    protected $errorMessage;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255)]
    #[Groups(['validation:read', 'validationAttribute:read', 'validationAttribute:write', 'questionType:read', 'service:read', 'onebot:read'])]
    private ?string $expression = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['validationAttribute:read', 'validation:read'])]
    private $createdAt;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['validationAttribute:read', 'validation:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ValidationAttributeTranslation>|\App\Entity\ValidationAttributeTranslation[]
     */
    #[ORM\OneToMany(targetEntity: ValidationAttributeTranslation::class, mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['validationAttribute:write', 'translations'])]
    protected Collection $translations;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionValidation>
     */
    #[ORM\OneToMany(targetEntity: QuestionValidation::class, mappedBy: 'validationAttribute', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $questionValidations;
    
    private $timezone = 'Africa/Nairobi';
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 15)]
    #[Groups(['validation:read', 'validationAttribute:read', 'validationAttribute:write', 'questionType:read', 'onebot:read'])]
    private ?string $type = "Regex";
    
    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->validation = new ArrayCollection();
        $this->questionValidations = new ArrayCollection();
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
     * @return Collection|Validation[]
     */
    public function getValidation() : Collection
    {
        return $this->validation;
    }
    public function addValidation(Validation $validation) : self
    {
        if (!$this->validation->contains($validation)) {
            $this->validation[] = $validation;
        }
        return $this;
    }
    public function removeValidation(Validation $validation) : self
    {
        $this->validation->removeElement($validation);
        return $this;
    }
    public function getErrorMessage() : ?string
    {
        return $this->getTranslation()->getErrorMessage();
    }
    public function setErrorMessage(string $errorMessage) : void
    {
        $this->getTranslation()->setErrorMessage($errorMessage);
    }
    public function getExpression() : ?string
    {
        return $this->expression;
    }
    public function setExpression(string $expression) : self
    {
        $this->expression = $expression;
        return $this;
    }
    public function getExpectedInput() : ?string
    {
        return $this->expectedInput;
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
            $questionValidation->setValidationAttribute($this);
        }
        return $this;
    }
    public function removeQuestionValidation(QuestionValidation $questionValidation) : self
    {
        if ($this->questionValidations->removeElement($questionValidation)) {
            // set the owning side to null (unless already changed)
            if ($questionValidation->getValidationAttribute() === $this) {
                $questionValidation->setValidationAttribute(null);
            }
        }
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ValidationAttributeTranslation();
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
    public function getType() : ?string
    {
        return $this->type;
    }
    public function setType(string $type) : self
    {
        $this->type = $type;
        return $this;
    }
}
