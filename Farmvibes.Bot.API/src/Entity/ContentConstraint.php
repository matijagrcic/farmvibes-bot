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
use App\Repository\ContentConstraintRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;

#[ApiResource(normalizationContext: ['groups' => ['onebot:read', 'read', 'translations']], denormalizationContext: ['groups' => ['write', 'translations']])]
#[ORM\Entity(repositoryClass: ContentConstraintRepository::class)]
#[ORM\HasLifecycleCallbacks]
class ContentConstraint extends AbstractTranslation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Content::class, inversedBy: 'constraints')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\Content $content = null;

    #[ORM\ManyToOne(targetEntity: Constraint::class, inversedBy: 'contentConstraints')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['onebot:read', 'write', 'read'])]
    private ?\App\Entity\Constraint $constraintItem = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    private $updatedAt;

    public $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[Groups(['onebot:read'])]
    private $filters = [];
    
    public function getId() : ?int
    {
        return $this->id;
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
    public function getConstraintItem() : ?Constraint
    {
        return $this->constraintItem;
    }
    public function setConstraintItem(?Constraint $constraintItem) : self
    {
        $this->constraintItem = $constraintItem;
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
    public function getFilters() : ?array
    {
        return $this->filters;
    }
    public function setFilters(?array $filters) : self
    {
        $this->filters = $filters;
        return $this;
    }
}
