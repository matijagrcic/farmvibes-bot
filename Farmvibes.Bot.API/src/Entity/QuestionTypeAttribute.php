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
use App\Repository\QuestionTypeAttributeRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['questionType:read']], denormalizationContext: ['groups' => ['questionType:write']], filters: ['translation.groups'])]
#[ORM\Entity(repositoryClass: QuestionTypeAttributeRepository::class)]
#[ORM\HasLifecycleCallbacks]
class QuestionTypeAttribute extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['questionType:read', 'question:read', 'service:read'])]
    private $id;

    #[Groups(['questionType:read', 'question:read', 'service:read'])]
    protected $name;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\QuestionType>
     */
    #[ORM\ManyToMany(targetEntity: QuestionType::class, inversedBy: 'attributes')]
    private \Doctrine\Common\Collections\Collection $questionType;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['question:read', 'questionType:read', 'questionType:write'])]
    private ?bool $defaultValue = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN)]
    #[Groups(['question:read', 'questionType:read', 'questionType:write'])]
    private ?bool $isPublished = false;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['question:read', 'questionType:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['question:read', 'questionType:read'])]
    private $updatedAt;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionTypeAttributeTranslation>|\App\Entity\QuestionTypeAttributeTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionTypeAttributeTranslation::class, mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['translations', 'questionType:write'])]
    protected Collection $translations;

    public $timezone = 'Africa/Nairobi';

    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->questionType = new ArrayCollection();
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
    /**
     * @return Collection|QuestionType[]
     */
    public function getQuestionType() : Collection
    {
        return $this->questionType;
    }
    public function addQuestionType(QuestionType $questionType) : self
    {
        if (!$this->questionType->contains($questionType)) {
            $this->questionType[] = $questionType;
        }
        return $this;
    }
    public function removeQuestionType(QuestionType $questionType) : self
    {
        $this->questionType->removeElement($questionType);
        return $this;
    }
    public function getDefaultValue() : ?bool
    {
        return $this->defaultValue;
    }
    public function setDefaultValue(?bool $defaultValue) : self
    {
        $this->defaultValue = $defaultValue;
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
    public function getTranslations() : Collection
    {
        return $this->translations;
    }
    public function __toString()
    {
        return $this->getName() === null ? "New" : $this->getName();
    }
    protected function createTranslation() : TranslationInterface
    {
        return new QuestionTypeAttributeTranslation();
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
