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
use App\Repository\QuestionOptionRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Component\Serializer\Annotation\Ignore;
use Symfony\Component\Serializer\Annotation\MaxDepth;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Link;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(operations:[new GetCollection(
    uriTemplate: '/questions/{questionId}/options', 
    uriVariables: [
        'questionId' => new Link(
            fromClass: Question::class,
            fromProperty: 'questionOptions'
        )
    ],
    order: ['translations.value' => 'ASC'])])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class QuestionOption extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['question:read','uxQuestionRequest:read', 'service:read', 'onebot:read'])]
    private $id;

    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'questionOptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Question $question = null;

    /**
     *  @var string
     */
    #[Groups(['translations'])]
    protected $value;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionOptionTranslation>|\App\Entity\QuestionOptionTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionOptionTranslation::class, mappedBy: 'translatable', indexBy: 'locale', cascade: ['PERSIST','REMOVE'], orphanRemoval: true)]
    #[Groups(['translations', 'service:write', 'question:write'])]
    protected Collection $translations;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['question:read'])]
    private $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['question:read'])]
    private $updatedAt;

    public $timezone = 'Africa/Nairobi';
    
    public function __construct()
    {
        $this->translations = new ArrayCollection();
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
    public function getValue() : ?string
    {
        return $this->getTranslation()->getValue();
    }
    public function setValue(?string $value) : void
    {
        $this->getTranslation()->setValue($value);
    }
    public function __toString()
    {
        return $this->getValue() === null ? "New" : $this->getValue();
    }
    protected function createTranslation() : TranslationInterface
    {
        return new QuestionOptionTranslation();
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

