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
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Serializer\Filter\GroupFilter;
use Metaclass\FilterBundle\Filter\FilterLogic;

#[ApiResource(order: ['createdAt' => 'DESC'],operations: [new Post(normalizationContext: ['groups' => ['content:read','translations']]), new Get(), new Delete(), new Patch(), new GetCollection()])]
#[ApiResource(normalizationContext: ['groups' => ['content:read','uxLibrary:read']])]
#[ApiResource(denormalizationContext: ['groups' => ['content:write']])]
#[ApiResource(filters: ['translation.groups'])]
#[ApiFilter(SearchFilter::class, properties: ['translations.label' => 'ipartial', 'text.contentTextVariants.translations.text' => 'ipartial'])]
#[ApiFilter(GroupFilter::class, arguments: ['parameterName' => 'groups', 'overrideDefaultGroups' => false, 'whitelist' => ['uxMenus:read','translations','uxLibrary:read','content:read', 'onebot:read']])]
#[ApiFilter(FilterLogic::class)]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Content extends AbstractTranslatable
{
    #[ORM\Column(type: Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['content:read', 'uxMenus:read', 'onebot:read','uxLibrary:read'])]
    private $id;

    /**
     * @var Collection<Media>
     */
    #[ORM\ManyToMany(targetEntity: Media::class, inversedBy: 'contents', cascade: ['persist','remove'])]
    #[Groups(['content:read', 'content:write'])]
    private Collection $media;

    /**
     * @var Collection<ContentText>
     */
    #[ORM\OneToMany(targetEntity: ContentText::class, mappedBy: 'content', orphanRemoval: true, cascade: ['persist','remove'])]
    #[Groups(['content:read', 'content:write', 'onebot:read', 'uxLibrary:read'])]
    #[ApiProperty(writableLink: true)]
    private Collection $text;
    /**
     * @var Collection<MenuNode>
     */
    #[ORM\OneToMany(targetEntity: MenuNode::class, mappedBy: 'content', orphanRemoval: true, cascade: ['persist','remove'])]
    private Collection $menuNodes;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['content:read','uxLibrary:read'])]
    private $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['content:read','uxLibrary:read'])]
    private $updatedAt;

    #[Groups(['content:read'])]
    protected $label;
    /**
     * @var Collection<int, ContentTranslation>|ContentTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'ContentTranslation', mappedBy: 'translatable', indexBy: 'locale', cascade: ['persist','remove'], orphanRemoval: true)]
    #[Groups(['content:write', 'translations'])]
    protected Collection $translations;

    public $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: Types::BOOLEAN, nullable: true)]
    #[Groups(['content:read', 'content:write','uxLibrary:read'])]
    private ?bool $isPublished = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::JSON)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['content:read', 'content:write', 'onebot:read'])]
    private $tags = [];

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

    public function getTags(): ?array
    {
        return $this->tags;
    }

    public function setTags(array $tags): self
    {
        $this->tags = $tags;

        return $this;
    }

}
