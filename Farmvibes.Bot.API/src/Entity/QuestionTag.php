<?php

namespace App\Entity;

use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(order: ['createdAt' => 'DESC'],filters: ['translation.groups'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class QuestionTag extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['question:read'])]
    private $id;

    #[Groups(['question:read', 'onebot:read'])]
    protected $name;

    #[Groups(['question:read', 'onebot:read'])]
    private $description;


    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['question:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['question:read'])]
    private $updatedAt;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ConstraintTranslation>|\App\Entity\ConstraintTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'QuestionTagTranslation', mappedBy: 'translatable', indexBy: 'locale', fetch: 'EAGER', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['translations'])]
    protected Collection $translations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Question>
     */
    #[ORM\OneToMany(targetEntity: Question::class, mappedBy: 'questionTag', orphanRemoval: true)]
    #[Groups(['question:read'])]
    private \Doctrine\Common\Collections\Collection $questions;

    private $timezone = 'Africa/Nairobi';

    public function __construct()
    {
        parent::__construct();
        $this->questions = new ArrayCollection();
        $this->translations = new ArrayCollection();
    }

    public function getId(): ?string
    {
        return $this->id;
    }
    
    public function getName(): ?string
    {
        return $this->getTranslation()->getName();
    }

    public function setName(string $name): void
    {
        $this->getTranslation()->setName($name);
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection|Question[]
     */
    public function getQuestions(): Collection
    {
        return $this->questions;
    }

    public function addQuestion(Question $question): self
    {
        if (!$this->questions->contains($question)) {
            $this->questions[] = $question;
            $question->setQuestionTag($this);
        }

        return $this;
    }

    public function removeQuestion(Question $question): self
    {
        if ($this->questions->removeElement($question)) {
            // set the owning side to null (unless already changed)
            if ($question->getQuestionTag() === $this) {
                $question->setQuestionTag(null);
            }
        }

        return $this;
    }

    /**
     * @throws \Exception
     * @ORM\PrePersist()
    */
    public function beforeUpdate(){
        $this->setUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }

    /**
     * @throws \Exception
     * @ORM\PrePersist()
    */
    public function beforeSave(){
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }

    protected function createTranslation(): TranslationInterface
    {
        return new QuestionTagTranslation();
    }
}
