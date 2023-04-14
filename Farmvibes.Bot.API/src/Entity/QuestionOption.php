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

#[ApiResource(normalizationContext: ['groups' => ['questionOption:read']], denormalizationContext: ['groups' => ['questionOption:write']])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class QuestionOption extends AbstractTranslatable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['questionOption:read', 'service:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Question::class, inversedBy: 'questionOptions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Question $question = null;

    /**
     *  @var string
     */
    #[Groups(['questionOption:read', 'translations'])]
    protected $value;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\QuestionOptionTranslation>|\App\Entity\QuestionOptionTranslation[]
     */
    #[ORM\OneToMany(targetEntity: QuestionOptionTranslation::class, mappedBy: 'translatable', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['questionOption:write', 'questionOption:read', 'translations', 'service:write', 'question:write', 'question:read'])]
    protected Collection $translations;

    public $timezone = 'Africa/Nairobi';
    
    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
    }
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
