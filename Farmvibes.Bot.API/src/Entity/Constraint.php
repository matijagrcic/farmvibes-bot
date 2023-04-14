<?php

namespace App\Entity;

use App\Repository\ConstraintRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use App\Controller\ConstraintOptions;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(normalizationContext: ['groups' => ['constraints:read']], denormalizationContext: ['groups' => ['constraints:write']],filters: ['translation.groups'])]
#[ORM\Table(name: 'constraints')]
#[ORM\Entity(repositoryClass: ConstraintRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Constraint extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['constraints:read'])]
    private $id;

    #[Groups(['menuNode:read','constraints:read'])]
    protected $name;

    #[Groups(['constraints:read'])]
    protected $description;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['constraints:read'])]
    private $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['constraints:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ConstraintTranslation>|\App\Entity\ConstraintTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'ConstraintTranslation', mappedBy: 'translatable', indexBy: 'locale', fetch: 'EAGER', cascade: ['PERSIST', 'REMOVE'], orphanRemoval: true)]
    #[Groups(['translations'])]
    protected Collection $translations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNodeConstraint>
     */
    #[ORM\OneToMany(targetEntity: MenuNodeConstraint::class, mappedBy: 'constraintItem', orphanRemoval: true)]
    private \Doctrine\Common\Collections\Collection $menuNodeConstraints;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentTextConstraint::class, mappedBy: 'constraintItem')]
    private \Doctrine\Common\Collections\Collection $contentTextConstraints;

    private $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: Types::STRING, length: 20, nullable: true)]
    #[Groups(['constraints:write', 'constraints:read'])]
    private ?string $entity = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['constraints:read'])]
    private $dataPaths = [];

    public function __construct()
    {
        parent::__construct();

        $this->questionConstraints = new ArrayCollection();
        $this->menuNodeConstraints = new ArrayCollection();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->contentTextConstraints = new ArrayCollection();
    }
    public function getId() : ?string
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
    public function setDescription(string $description)
    {
        $this->getTranslation()->setDescription($description);
    }
    public function getDescription() : ?string
    {
        return $this->getTranslation()->getDescription();
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
}
