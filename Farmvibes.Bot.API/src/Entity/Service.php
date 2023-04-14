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
use App\Repository\ServiceRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Serializer\Filter\GroupFilter;

#[ApiResource(order: ['createdAt' => 'DESC'],filters: ['translation.groups'])]
#[ApiResource(normalizationContext: ['groups' => ['service:read','uxServiceRequest:read']])]
#[ApiResource(denormalizationContext: ['groups' => ['service:write']])]
#[ApiFilter(SearchFilter::class, properties: ['translations.name' => 'ipartial', 'name' => 'partial'])]
#[ApiFilter(GroupFilter::class, arguments: ['parameterName' => 'groups', 'overrideDefaultGroups' => false, 'whitelist' => ['uxServiceRequest:read', 'onebot:read']])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Service extends AbstractTranslatable
{
    const DEFAULT_SUB_TYPE = 'default';
    #[ORM\Column(type: Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(["service:read", "uxServiceRequest:read", "onebot:read"])]
    private $id;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Question>
     */
    #[ORM\OneToMany(targetEntity: Question::class, mappedBy: 'service', orphanRemoval: true)]
    #[Groups(['service:read', 'onebot:read'])]
    private Collection $questions;
    
    /**
     *  @var string
     */
    #[Groups(['service:read', 'onebot:read'])]
    protected $name;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ServiceTranslation>|\App\Entity\ServiceTranslation[]
     */
    #[ORM\OneToMany(targetEntity: ServiceTranslation::class, mappedBy: 'translatable', fetch: 'EAGER', indexBy: 'locale', cascade: ['PERSIST','REMOVE'], orphanRemoval: true)]
    #[Groups(['service:write', 'translations'])]
    protected Collection $translations;
    
    #[ORM\ManyToOne(targetEntity: ServiceType::class, inversedBy: 'services')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['service:read', 'service:write', 'uxServiceRequest:read', 'onebot:read'])]
    #[ApiProperty(readableLink: false )]
    private ?\App\Entity\ServiceType $type = null;
    
    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['service:read', 'service:write', 'uxServiceRequest:read', 'onebot:read'])]
    private ?bool $isPublished = false;
    
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['service:read', 'uxServiceRequest:read'])]
    private $createdAt;
    
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['service:read', 'uxServiceRequest:read'])]
    private $updatedAt;
    
    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\MenuNode>
     */
    #[ORM\OneToMany(targetEntity: MenuNode::class, mappedBy: 'service', orphanRemoval: true)]
    private Collection $menuNodes;
    
    #[ORM\ManyToOne(targetEntity: ServiceSubType::class, inversedBy: 'services')]
    #[Groups(['service:read', 'onebot:read'])]
    private ?\App\Entity\ServiceSubType $subtype = null;
    
    private $timezone = 'Africa/Nairobi';
    
    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['service:read', 'service:write', 'onebot:read', 'uxServiceRequest:read'])]
    private ?bool $singleAccess = false;
    
    #[ORM\Column(type: Types::BOOLEAN)]
    #[Groups(['service:read', 'service:write', 'onebot:read', 'uxServiceRequest:read'])]
    private ?bool $backAfterCompletion = false;

    #[ORM\Column(nullable: true)]
    #[Groups(['service:read', 'service:write', 'onebot:read', 'uxServiceRequest:read'])]
    private ?bool $isSystem = null;
    
    public function __construct()
    {
        parent::__construct();
        $this->translations = new ArrayCollection();
        $this->questions = new ArrayCollection();
        $this->constraints = new ArrayCollection();
        $this->menuNodes = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
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
            $question->setService($this);
        }
        return $this;
    }
    public function removeQuestion(Question $question) : self
    {
        if ($this->questions->removeElement($question)) {
            // set the owning side to null (unless already changed)
            if ($question->getService() === $this) {
                $question->setService(null);
            }
        }
        return $this;
    }
    public function getName() : ?string
    {
        return $this->getTranslation()->getName();
    }
    public function setName(string $name) : void
    {
        $this->getTranslation()->setName($name);
    }
    public function getIntroduction() : ?string
    {
        return $this->getTranslation()->getIntroduction();
    }
    public function setIntroduction(string $introduction) : void
    {
        $this->getTranslation()->setIntroduction($introduction);
    }
    public function getConclusion() : ?string
    {
        return $this->getTranslation()->getConclusion();
    }
    public function setConclusion(string $conclusion) : void
    {
        $this->getTranslation()->setConclusion($conclusion);
    }
    
    public function __toString()
    {
        return $this->getName() === null ? "New" : $this->getName();
    }
    public function getType() : ?ServiceType
    {
        return $this->type;
    }
    public function setType(?ServiceType $type) : self
    {
        $this->type = $type;
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
    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave(LifecycleEventArgs $event)
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
        $this->createdAt = $now;
        $this->updatedAt = $now;
        //If we have no sub-type, let's set the default
        if (!$this->subtype instanceof ServiceSubType) {
            $subtype = $event->getObjectManager()->getRepository(ServiceSubType::class)->findOneBy(['name' => self::DEFAULT_SUB_TYPE]);
            $this->setSubtype($subtype);
        }
    }
    /**
     * @throws \Exception
     */
    #[ORM\PreUpdate]
    public function beforeUpdate()
    {
        $this->updatedAt = new \DateTimeImmutable('now', new \DateTimeZone($this->timezone));
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
     * @return Collection|MenuNode[]
     */
    public function getMenuNodes() : Collection
    {
        return $this->menuNodes;
    }
    public function addMenuNode(MenuNode $menuNode) : self
    {
        if (!$this->menuNodes->contains($menuNode)) {
            $this->menuNodes[] = $menuNode;
            $menuNode->setService($this);
        }
        return $this;
    }
    public function removeMenuNode(MenuNode $menuNode) : self
    {
        if ($this->menuNodes->removeElement($menuNode)) {
            // set the owning side to null (unless already changed)
            if ($menuNode->getService() === $this) {
                $menuNode->setService(null);
            }
        }
        return $this;
    }
    public function getSubtype() : ?ServiceSubType
    {
        return $this->subtype;
    }
    public function setSubtype(?ServiceSubType $subtype) : self
    {
        $this->subtype = $subtype;
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new ServiceTranslation();
    }
    public function getSingleAccess() : ?bool
    {
        return $this->singleAccess;
    }
    public function setSingleAccess(bool $singleAccess) : self
    {
        $this->singleAccess = $singleAccess;
        return $this;
    }
    public function getBackAfterCompletion() : ?bool
    {
        return $this->backAfterCompletion;
    }
    public function setBackAfterCompletion(bool $backAfterCompletion) : self
    {
        $this->backAfterCompletion = $backAfterCompletion;
        return $this;
    }

    public function isIsSystem(): ?bool
    {
        return $this->isSystem;
    }

    public function setIsSystem(?bool $isSystem): self
    {
        $this->isSystem = $isSystem;

        return $this;
    }
}
