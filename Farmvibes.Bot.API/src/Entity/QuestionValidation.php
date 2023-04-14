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
use App\Repository\QuestionValidationRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Metadata\Link;

#[ApiResource(normalizationContext: ['groups' => ['questionValidation:read']], denormalizationContext: ['groups' => ['questionValidation:write']], filters: ['translation.groups'])]
#[ApiResource(uriTemplate: '/question/{questionId}/validations', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'questionValidations'
        )
    ],
    order: ['createdAt' => 'ASC'],
    operations: [new GetCollection()],
    filters: ['translation.groups'])
]
#[ORM\Entity(repositoryClass: QuestionValidationRepository::class)]
#[ORM\HasLifecycleCallbacks]
class QuestionValidation extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['validation:read', 'service:read', 'questionValidation:read'])]
    private $id;
    
    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'questionValidations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['questionValidation:write'])]
    private ?\App\Entity\Question $question = null;
    
    #[Groups(['questionValidation:read', 'question:read', 'question:write', 'onebot:read'])]
    protected $errorMessage;
    
    #[ORM\ManyToOne(targetEntity: ValidationAttribute::class, inversedBy: 'questionValidations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['service:read', 'questionValidation:read', 'questionValidation:write', 'question:write', 'onebot:read'])]
    private ?\App\Entity\ValidationAttribute $validationAttribute = null;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionValidationTranslation>|\App\Entity\QuestionValidationTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionValidationTranslation::class, mappedBy: 'translatable', fetch: 'EAGER', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['questionValidation:write', 'translations'])]
    protected Collection $translations;
    
    private $timezone = 'Africa/Nairobi';
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['question:read', 'questionValidation:read'])]
    private $createdAt;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['question:read', 'questionValidation:read'])]
    private $updatedAt;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 100)]
    #[Groups(['questionValidation:read', 'question:read', 'questionValidation:write', 'service:read', 'onebot:read'])]
    private ?string $expectedInput = null;
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Groups(['questionValidation:read', 'question:read', 'questionValidation:write', 'service:read', 'onebot:read'])]
    private ?string $expression = null;
    
    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
    }
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
    public function getErrorMessage() : ?string
    {
        return $this->getTranslation()->getErrorMessage();
    }
    public function setErrorMessage(string $errorMessage) : void
    {
        $this->getTranslation()->setErrorMessage($errorMessage);
    }
    /**
     */
    #[ApiProperty(readableLink: true)]
    public function getValidationAttribute() : ?ValidationAttribute
    {
        return $this->validationAttribute;
    }
    public function setValidationAttribute(?ValidationAttribute $validationAttribute) : self
    {
        $this->validationAttribute = $validationAttribute;
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new QuestionValidationTranslation();
    }
    public function __toString()
    {
        return $this->getErrorMessage() === null ? "New" : $this->getErrorMessage();
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
    public function getExpectedInput() : ?string
    {
        return $this->expectedInput;
    }
    public function setExpectedInput(string $expectedInput) : self
    {
        $this->expectedInput = $expectedInput;
        return $this;
    }
    public function getExpression() : ?string
    {
        return $this->expression;
    }
    public function setExpression(?string $expression) : self
    {
        $this->expression = $expression;
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
}
