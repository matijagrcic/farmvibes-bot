<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ContentTextRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Action\NotFoundAction;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ApiResource(order: ['createdAt' => 'DESC'],operations: [new Post(normalizationContext: ['groups' => ['translations','content:read']]), new Get(), new Delete(), new Patch()])]
#[ApiResource(uriTemplate: '/contents/{contentId}/add_text', 
    uriVariables: [
        'contentId' => new Link(
            fromClass: Content::class,
            fromProperty: 'text'
        )
    ],
    operations: [new Post()])
]
#[ApiResource(uriTemplate: '/contents/{contentId}/update_text/{id}', 
    uriVariables: [
        'contentId' => new Link(
            fromClass: Content::class,
            fromProperty: 'text'
        ),
        'id' => new Link(
            fromClass: ContentText::class
        )
    ],
    operations: [new Patch(normalizationContext: ['groups' => ['content:read','translations']])])
]
#[ApiResource(uriTemplate: '/contents/{contentId}/all_text', 
    uriVariables: [
        'contentId' => new Link(
            fromClass: Content::class,
            fromProperty: 'text'
        )
    ],
    operations: [new GetCollection()])
]
#[ApiResource(uriTemplate: '/contents/{contentId}/text/{id}', 
    uriVariables: [
        'contentId' => new Link(
            fromClass: Content::class,
            fromProperty: 'content'
        ),
        'id' => new Link(
            fromClass: ContentText::class
        )
    ],
    operations: [new Get()])
]

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class ContentText
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups('content:read')]
    private $id;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentTextConstraint::class, mappedBy: 'text', orphanRemoval: true, cascade: ['PERSIST'])]
    #[Groups(['content:read', 'content:write','onebot:read'])]
    private Collection $constraints;

    #[ORM\ManyToOne(targetEntity: Content::class, inversedBy: 'text')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Content $content = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups('content:read')]
    private $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups('content:read')]
    private $updatedAt;

    public $timezone = 'Africa/Nairobi';
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextVariant>
     */
    #[ORM\OneToMany(targetEntity: ContentTextVariant::class, mappedBy: 'contentText', orphanRemoval: true, cascade: ['PERSIST', 'REMOVE'])]
    #[Groups([ 'content:read', 'content:write', 'onebot:read'])]
    #[ApiProperty(writableLink: true)]
    private Collection $contentTextVariants;

    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['content:read', 'content:write'])]
    private ?bool $isPublished = false;
    
    #[ORM\Column(type: Types::JSON)]
    #[Groups(['content:read', 'content:write'])]
    private $raw = [];

    public function __construct()
    {
        $this->constraints = new ArrayCollection();
        $this->contentTextVariants = new ArrayCollection();
    }

    public function getId() : ?string
    {
        return $this->id;
    }
    /**
     * @return Collection|ContentTextConstraint[]
     */
    public function getConstraints() : Collection
    {
        return $this->constraints;
    }
    public function addConstraint(ContentTextConstraint $constraint) : self
    {
        if (!$this->constraints->contains($constraint)) {
            $this->constraints[] = $constraint;
            $constraint->setText($this);
        }
        return $this;
    }
    public function removeConstraint(ContentTextConstraint $constraint) : self
    {
        if ($this->constraints->removeElement($constraint)) {
            // set the owning side to null (unless already changed)
            if ($constraint->getText() === $this) {
                $constraint->setText(null);
            }
        }
        return $this;
    }
    
    public function getContent() : ?Content
    {
        return $this->content;
    }
    public function setContent(?Content $content) : self
    {
        $this->content = $content;
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
     * @return Collection|ContentTextVariant[]
     */
    public function getContentTextVariants() : Collection
    {
        return $this->contentTextVariants;
    }
    public function addContentTextVariant(ContentTextVariant $contentTextVariant) : self
    {
        if (!$this->contentTextVariants->contains($contentTextVariant)) {
            $this->contentTextVariants[] = $contentTextVariant;
            $contentTextVariant->setContentText($this);
        }
        return $this;
    }
    public function removeContentTextVariant(ContentTextVariant $contentTextVariant) : self
    {
        if ($this->contentTextVariants->removeElement($contentTextVariant)) {
            // set the owning side to null (unless already changed)
            if ($contentTextVariant->getContentText() === $this) {
                $contentTextVariant->setContentText(null);
            }
        }
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
    public function getRaw() : ?array
    {
        return $this->raw;
    }
    public function setRaw(array $raw) : self
    {
        $this->raw = $raw;
        return $this;
    }
}
