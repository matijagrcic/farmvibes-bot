<?php

namespace App\Entity;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\ContentTextRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

// #[ApiResource(operations: [new Patch(), new Delete(), new Get(), new GetCollection()], order: ['createdAt' => 'DESC'], paginationPartial: true, normalizationContext: ['groups' => ['contentText:read']], denormalizationContext: ['groups' => ['contentText:write']], filters: ['translation.groups'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class ContentText
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['contentText:read', 'content:read'])]
    private ?int $id = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextConstraint>
     */
    #[ORM\OneToMany(targetEntity: ContentTextConstraint::class, mappedBy: 'text', orphanRemoval: true, cascade: ['PERSIST'])]
    #[Groups(['contentText:read', 'contentText:write', 'content:read', 'content:write'])]
    private \Doctrine\Common\Collections\Collection $contentTextConstraints;

    #[ORM\ManyToOne(targetEntity: Content::class, inversedBy: 'text')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Content $content = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['contentText:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['contentText:read'])]
    private $updatedAt;

    public $timezone = 'Africa/Nairobi';
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\ContentTextVariant>
     */
    #[ORM\OneToMany(targetEntity: ContentTextVariant::class, mappedBy: 'contentText', orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['contentText:read', 'contentText:write', 'translations', 'content:read', 'content:write'])]
    private \Doctrine\Common\Collections\Collection $contentTextVariants;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN)]
    #[Groups(['contentText:read', 'contentText:write', 'content:read', 'content:write'])]
    private ?bool $isPublished = false;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['contentText:read', 'contentText:write', 'content:read', 'content:write'])]
    private $raw = [];

    public function __construct()
    {
        $this->contentTextConstraints = new ArrayCollection();
        $this->contentTextVariants = new ArrayCollection();
    }

    public function getId() : ?int
    {
        return $this->id;
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
            $contentTextConstraint->setText($this);
        }
        return $this;
    }
    public function removeContentTextConstraint(ContentTextConstraint $contentTextConstraint) : self
    {
        if ($this->contentTextConstraints->removeElement($contentTextConstraint)) {
            // set the owning side to null (unless already changed)
            if ($contentTextConstraint->getText() === $this) {
                $contentTextConstraint->setText(null);
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
