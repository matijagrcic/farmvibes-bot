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
use App\Repository\ConstraintRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use App\Controller\ConstraintOptions;

#[ORM\Table(name: 'constraints')]
#[ORM\Entity(repositoryClass: ConstraintRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Constraint extends AbstractTranslatable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['constraints:read'])]
    private ?int $id = null;

    #[Groups(['menuNode:read', 'service:read', 'constraints:read'])]
    protected $name;

    #[Groups(['constraints:read'])]
    protected $description;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['constraints:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['constraints:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ConstraintTranslation>|\App\Entity\ConstraintTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'ConstraintTranslation', mappedBy: 'translatable', indexBy: 'locale', fetch: 'EXTRA_LAZY', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['translations'])]
    protected Collection $translations;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ServiceConstraint>
     */
    #[ORM\OneToMany(targetEntity: ServiceConstraint::class, mappedBy: 'constaintItem', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $serviceConstraints;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNodeConstraint>
     */
    #[ORM\OneToMany(targetEntity: MenuNodeConstraint::class, mappedBy: 'constraintItem', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $menuNodeConstraints;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentConstraint::class, mappedBy: 'constraintItem', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $contentConstraints;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentTextConstraint::class, mappedBy: 'constraintItem')]
    private \Doctrine\Common\Collections\Collection $contentTextConstraints;

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 20, nullable: true)]
    #[Groups(['constraints:write', 'constraints:read'])]
    private ?string $entity = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON, nullable: true)]
    #[Groups(['constraints:read'])]
    private $dataPaths = [];

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON, nullable: true)]
    private $raw = [];

    public function __construct()
    {
        parent::__construct();
        $this->questionConstraints = new ArrayCollection();
        $this->services = new ArrayCollection();
        $this->questions = new ArrayCollection();
        $this->serviceConstraints = new ArrayCollection();
        $this->menuNodeConstraints = new ArrayCollection();
        $this->contentConstraints = new ArrayCollection();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->contentTextConstraints = new ArrayCollection();
    }
    public function getId() : ?int
    {
        return $this->id;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ConstraintTranslation();
    }
    public function setName(string $name)
    {
        $this->getTranslation()->setName($name);
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    public function getDescription() : ?string
    {
        return $this->getTranslation()->getDescription();
    }
    public function setDescription(?string $description) : self
    {
        $this->getTranslation()->setDescription($description);
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
    /**
     * @return Collection|Service[]
     */
    public function getServices() : Collection
    {
        return $this->services;
    }
    public function addService(Service $service) : self
    {
        if (!$this->services->contains($service)) {
            $this->services[] = $service;
            $service->addContraint($this);
        }
        return $this;
    }
    public function removeService(Service $service) : self
    {
        if ($this->services->removeElement($service)) {
            $service->removeContraint($this);
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
            $question->addConstraint($this);
        }
        return $this;
    }
    public function removeQuestion(Question $question) : self
    {
        if ($this->questions->removeElement($question)) {
            $question->removeConstraint($this);
        }
        return $this;
    }
    /**
     * @return Collection|ServiceConstraint[]
     */
    public function getServiceConstraints() : Collection
    {
        return $this->serviceConstraints;
    }
    public function addServiceConstraint(ServiceConstraint $serviceConstraint) : self
    {
        if (!$this->serviceConstraints->contains($serviceConstraint)) {
            $this->serviceConstraints[] = $serviceConstraint;
            $serviceConstraint->setConstaintItem($this);
        }
        return $this;
    }
    public function removeServiceConstraint(ServiceConstraint $serviceConstraint) : self
    {
        if ($this->serviceConstraints->removeElement($serviceConstraint)) {
            // set the owning side to null (unless already changed)
            if ($serviceConstraint->getConstaintItem() === $this) {
                $serviceConstraint->setConstaintItem(null);
            }
        }
        return $this;
    }
    /**
     * @return Collection|MenuNodeConstraint[]
     */
    public function getMenuNodeConstraints() : Collection
    {
        return $this->menuNodeConstraints;
    }
    public function addMenuNodeConstraint(MenuNodeConstraint $menuNodeConstraint) : self
    {
        if (!$this->menuNodeConstraints->contains($menuNodeConstraint)) {
            $this->menuNodeConstraints[] = $menuNodeConstraint;
            $menuNodeConstraint->setConstraintItem($this);
        }
        return $this;
    }
    public function removeMenuNodeConstraint(MenuNodeConstraint $menuNodeConstraint) : self
    {
        if ($this->menuNodeConstraints->removeElement($menuNodeConstraint)) {
            // set the owning side to null (unless already changed)
            if ($menuNodeConstraint->getConstraintItem() === $this) {
                $menuNodeConstraint->setConstraintItem(null);
            }
        }
        return $this;
    }
    /**
     * @return Collection|ContentConstraint[]
     */
    public function getContentConstraints() : Collection
    {
        return $this->contentConstraints;
    }
    public function addContentConstraint(ContentConstraint $contentConstraint) : self
    {
        if (!$this->contentConstraints->contains($contentConstraint)) {
            $this->contentConstraints[] = $contentConstraint;
            $contentConstraint->setConstraintItem($this);
        }
        return $this;
    }
    public function removeContentConstraint(ContentConstraint $contentConstraint) : self
    {
        if ($this->contentConstraints->removeElement($contentConstraint)) {
            // set the owning side to null (unless already changed)
            if ($contentConstraint->getConstraintItem() === $this) {
                $contentConstraint->setConstraintItem(null);
            }
        }
        return $this;
    }
    /**
     * @return Collection|ContentTextConstraint[]
     */
    public function getContentTextConstraints() : Collection
    {
        return $this->contentTextConstraints;
    }
    public function addContentTextConstraint(ContentTextConstraint $contentTextConstraint) : self
    {
        if (!$this->contentTextConstraints->contains($contentTextConstraint)) {
            $this->contentTextConstraints[] = $contentTextConstraint;
            $contentTextConstraint->setConstraintItem($this);
        }
        return $this;
    }
    public function removeContentTextConstraint(ContentTextConstraint $contentTextConstraint) : self
    {
        if ($this->contentTextConstraints->removeElement($contentTextConstraint)) {
            // set the owning side to null (unless already changed)
            if ($contentTextConstraint->getConstraintItem() === $this) {
                $contentTextConstraint->setConstraintItem(null);
            }
        }
        return $this;
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeUpdate()
    {
        $this->SetUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave()
    {
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
    public function getEntity() : ?string
    {
        return $this->entity;
    }
    public function setEntity(?string $entity) : self
    {
        $this->entity = $entity;
        return $this;
    }
    public function getDataPaths() : ?array
    {
        return $this->dataPaths;
    }
    public function setDataPaths(?array $dataPaths) : self
    {
        $this->dataPaths = $dataPaths;
        return $this;
    }
    public function getRaw() : ?array
    {
        return $this->raw;
    }
    public function setRaw(?array $raw) : self
    {
        $this->raw = $raw;
        return $this;
    }
}
