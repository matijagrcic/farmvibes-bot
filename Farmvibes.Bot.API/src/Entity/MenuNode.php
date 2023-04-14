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
use App\Repository\MenuNodeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Controller\NodesByMenu;
use App\Controller\PublishAllNodes;
use App\Controller\NodePersist;
use Symfony\Component\Serializer\Annotation\MaxDepth;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use App\Dto\MenuNodeInput;
use Gedmo\Tree\Entity\Repository\NestedTreeRepository;

#[Gedmo\Tree(type: 'nested')]
#[ApiResource(operations: [new Get(), new Patch(), new Delete(), new Put(), new Get(uriTemplate: '/menu_nodes/{root}/nodes', controller: NodesByMenu::class, read: false, openapiContext: ['parameters' => [['name' => 'root', 'in' => 'path', 'description' => 'Id of the root node', 'type' => 'string', 'required' => false, 'example' => '9dd79e66-0684-4f34-be80-889ef1c06344']], 'description' => 'This endpoint fetches node object formated in a way that the bot and menu builder. If the root is provided, the result will only consist of a single tree otherwise all available trees will be returned.', 'summary' => 'Fetches nodes in arranged in tree format']), new Post(controller: PublishAllNodes::class, read: false, uriTemplate: '/menu_nodes/publish_menu', openapiContext: ['summary' => 'Publish menu node', 'description' => 'This endpoint allows publication of menu node(s). The user can decided to publish only the menu node or all nodes in the tree.', 'parameters' => [['name' => 'node', 'in' => 'path', 'description' => 'Id of the node', 'type' => 'string', 'required' => true, 'example' => '9dd79e66-0684-4f34-be80-889ef1c06344'], ['name' => 'publish', 'in' => 'path', 'description' => 'String indicating whether to publish all or single node', 'type' => 'string', 'required' => true, 'example' => 'all / single'], ['name' => 'isPublished', 'in' => 'path', 'description' => 'New status of the nodes', 'type' => 'bool', 'required' => true, 'example' => 'true / false']]]), new GetCollection(), new Post(), new Post(controller: NodePersist::class, uriTemplate: '/menu_nodes/persist', read: false, deserialize: false)], forceEager: false, normalizationContext: ['groups' => ['menuNode:read']], denormalizationContext: ['groups' => ['menuNode:write']], filters: ['translation.groups'])]
#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: NestedTreeRepository::class)]
class MenuNode extends AbstractTranslatable
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['menuNode:read'])]
    private $id;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER, nullable: true)]
    #[Groups(['menuNode:read', 'menuNode:write'])]
    private ?int $position = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['menuNode:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['menuNode:read'])]
    private $updatedAt;
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNodeConstraint>
     */
    #[ORM\OneToMany(targetEntity: MenuNodeConstraint::class, mappedBy: 'node', orphanRemoval: true, cascade: ['persist'])]
    #[Groups(['menuNode:read', 'menuNode:write'])]
    private \Doctrine\Common\Collections\Collection $constraints;

    #[ORM\ManyToOne(targetEntity: MenuNodeType::class, inversedBy: 'menuNodes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['menuNode:read', 'menuNode:write'])]
    private ?\App\Entity\MenuNodeType $type = null;

    #[ORM\ManyToOne(targetEntity: Service::class, inversedBy: 'menuNodes')]
    #[Groups(['menuNode:write', 'menuNode:read'])]
    private ?\App\Entity\Service $service = null;

    #[ORM\ManyToOne(targetEntity: Content::class, inversedBy: 'menuNodes', cascade: ['PERSIST'])]
    #[Groups(['menuNode:write', 'menuNode:read'])]
    private ?\App\Entity\Content $content = null;

    #[Gedmo\TreeLeft]
    #[ORM\Column(name: 'lft', type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $lft = null;

    #[Gedmo\TreeLevel]
    #[ORM\Column(name: 'lvl', type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $lvl = null;
    
    #[Gedmo\TreeRight]
    #[ORM\Column(name: 'rgt', type: \Doctrine\DBAL\Types\Types::INTEGER)]
    private ?int $rgt = null;
    
    #[Gedmo\TreeRoot]
    #[ORM\ManyToOne(targetEntity: 'MenuNode')]
    #[ORM\JoinColumn(name: 'tree_root', onDelete: 'CASCADE')]
    private ?MenuNode $root = null;
    
    #[Gedmo\TreeParent]
    #[ORM\ManyToOne(targetEntity: 'MenuNode', inversedBy: 'children')]
    #[ORM\JoinColumn(name: 'parent_id', onDelete: 'CASCADE')]
    #[Groups(['menuNode:write', 'menuNode:read'])]
    private ?MenuNode $parent = null;
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNode>
     */
    #[ORM\OneToMany(targetEntity: 'MenuNode', mappedBy: 'parent')]
    #[ORM\OrderBy(['lft' => 'ASC'])]
    private \Doctrine\Common\Collections\Collection $children;
    /*
     * @var Attribute
     */
    public $parentId;
    
    #[Groups(['menuNode:read'])]
    protected $description;
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNodeTranslation>
     */
    #[ORM\OneToMany(targetEntity: 'MenuNodeTranslation', mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST', 'REMOVE'], orphanRemoval: true)]
    #[Groups(['menuNode:write', 'translations'])]
    protected \Doctrine\Common\Collections\Collection $translations;
    
    #[Groups(['menuNode:read'])]
    protected $label;
    
    private $timezone = 'Africa/Nairobi';
    
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::BOOLEAN)]
    #[Groups(['menuNode:read', 'menuNode:write'])]
    private ?bool $isPublished = false;
    
    public function __construct()
    {
        $this->children = new \Doctrine\Common\Collections\ArrayCollection();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
        $this->constraints = new ArrayCollection();
        $this->contents = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getPosition() : ?int
    {
        return $this->position;
    }
    public function setPosition(int $position) : self
    {
        $this->position = $position;
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
     * @return Collection|MenuNodeConstraint[]
     */
    public function getConstraints() : Collection
    {
        return $this->constraints;
    }
    public function addConstraint(MenuNodeConstraint $constraint) : self
    {
        if (!$this->constraints->contains($constraint)) {
            $this->constraints[] = $constraint;
            $constraint->setNode($this);
        }
        return $this;
    }
    public function removeConstraint(MenuNodeConstraint $constraint) : self
    {
        if ($this->constraints->removeElement($constraint)) {
            // set the owning side to null (unless already changed)
            if ($constraint->getNode() === $this) {
                $constraint->setNode(null);
            }
        }
        return $this;
    }
    public function getType() : ?MenuNodeType
    {
        return $this->type;
    }
    public function setType(?MenuNodeType $type) : self
    {
        $this->type = $type;
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
    public function getService() : ?Service
    {
        return $this->service;
    }
    public function setService(?Service $service) : self
    {
        $this->service = $service;
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
    /**
     * Persists the a new content object.
     */
    #[Groups(['menuNode:write', 'content:write'])]
    public function setContentObj(?array $contentObj) : self
    {
        //$this->content = $contentObj;
        return $this;
    }
    public function getRoot()
    {
        return $this->root;
    }
    public function setParent(MenuNode $parent = null)
    {
        $this->parent = $parent;
    }
    public function getParent()
    {
        return $this->parent;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new MenuNodeTranslation();
    }
    public function setLabel(string $label)
    {
        $this->getTranslation()->setLabel($label);
    }
    public function getLabel() : ?string
    {
        return $this->getTranslation()->getLabel();
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
    public function getIsPublished() : ?bool
    {
        return $this->isPublished;
    }
    public function setIsPublished(?bool $isPublished) : self
    {
        $this->isPublished = $isPublished;
        return $this;
    }
}
