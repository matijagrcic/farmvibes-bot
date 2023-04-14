<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ContentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Controller\ContentTextPersist;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(operations: [new Get(), new Patch(), new Delete(), new Put(), new Post(uriTemplate: '/contents/add_text', controller: ContentTextPersist::class, read: false, openapiContext: ['description' => 'This endpoint provides a way to add content text and variants to a content object without incurring circular reference issue as a result of the nested nature of the Content -> ContentText and ContentTextVariants.', 'summary' => 'Persist new content text item and it\'s translations.']), new Post(), new GetCollection()], order: ['createdAt' => 'DESC'], normalizationContext: ['groups' => ['content:read']], denormalizationContext: ['groups' => ['content:write']], filters: ['translation.groups'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Content extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['content:read', 'menuNode:read'])]
    private $id;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Media>
     */
    #[ORM\ManyToMany(targetEntity: Media::class, inversedBy: 'contents', cascade: ['persist'])]
    #[Groups(['content:read', 'content:write'])]
    private \Doctrine\Common\Collections\Collection $media;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentConstraint::class, mappedBy: 'content', orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['content:read', 'content:write'])]
    private \Doctrine\Common\Collections\Collection $constraints;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ContentText>|\App\Entity\ContentText[]
     */
    #[ORM\OneToMany(targetEntity: ContentText::class, mappedBy: 'content', orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['content:read', 'content:write'])]
    private iterable $text;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNode>
     */
    #[ORM\OneToMany(targetEntity: MenuNode::class, mappedBy: 'content', orphanRemoval: true, cascade: ['persist'])]
    private \Doctrine\Common\Collections\Collection $menuNodes;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['content:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['content:read'])]
    private $updatedAt;

    #[Groups(['content:read'])]
    protected $label;
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ContentTranslation>|\App\Entity\ContentTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'ContentTranslation', mappedBy: 'translatable', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['content:write', 'translations'])]
    protected Collection $translations;

    public $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN, nullable: true)]
    #[Groups(['content:read', 'content:write'])]
    private ?bool $isPublished = null;

    public function __construct()
    {
        parent::__construct();
        $this->translations = new ArrayCollection();
        $this->media = new ArrayCollection();
        $this->constraints = new ArrayCollection();
        $this->text = new ArrayCollection();
        $this->menuNodes = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    /**
     * @return Collection|Media[]
     */
    public function getMedia() : Collection
    {
        return $this->media;
    }
    public function addMedium(Media $medium) : self
    {
        if (!$this->media->contains($medium)) {
            $this->media[] = $medium;
        }
        return $this;
    }
    public function removeMedium(Media $medium) : self
    {
        $this->media->removeElement($medium);
        return $this;
    }
    /**
     * @return Collection|ContentConstraint[]
     */
    public function getConstraints() : Collection
    {
        return $this->constraints;
    }
    public function addConstraint(ContentConstraint $constraint) : self
    {
        if (!$this->constraints->contains($constraint)) {
            $this->constraints[] = $constraint;
            $constraint->setContent($this);
        }
        return $this;
    }
    public function removeConstraint(ContentConstraint $constraint) : self
    {
        if ($this->constraints->removeElement($constraint)) {
            // set the owning side to null (unless already changed)
            if ($constraint->getContent() === $this) {
                $constraint->setContent(null);
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
    /**
     * @return Collection|ContentText[]
     */
    public function getText() : Collection
    {
        return $this->text;
    }
    public function addText(ContentText $text) : self
    {
        if (!$this->text->contains($text)) {
            $this->text[] = $text;
            $text->setContent($this);
        }
        return $this;
    }
    public function removeText(ContentText $text) : self
    {
        if ($this->text->removeElement($text)) {
            // set the owning side to null (unless already changed)
            if ($text->getContent() === $this) {
                $text->setContent(null);
            }
        }
        return $this;
    }
    /**
     * @return Collection|MenuNode[]
     */
    public function getMenuNodes() : Collection
    {
        return $this->menuNodes;
    }
    public function addMenuNodes(MenuNode $menuNode) : self
    {
        if (!$this->menuNodes->contains($menuNode)) {
            $this->menuNodes[] = $menuNode;
            $menuNode->setContent($this);
        }
        return $this;
    }
    public function removeMenuNodes(MenuNode $menuNode) : self
    {
        if ($this->text->removeElement($menuNode)) {
            // set the owning side to null (unless already changed)
            if ($menuNodes->getContent() === $this) {
                $menuNode->setContent(null);
            }
        }
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
    public function getIsPublished() : ?bool
    {
        return $this->isPublished;
    }
    public function setIsPublished(?bool $isPublished) : self
    {
        $this->isPublished = $isPublished;
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ContentTranslation();
    }
    public function getLabel() : ?string
    {
        return $this->getTranslation()->getLabel();
    }
    public function setLabel(?string $label) : self
    {
        $this->getTranslation()->setLabel($label);
        return $this;
    }
}
