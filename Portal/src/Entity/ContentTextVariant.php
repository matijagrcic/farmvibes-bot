<?php

namespace App\Entity;

use App\Repository\ContentTextVariantRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use ApiPlatform\Core\Annotation\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class ContentTextVariant extends AbstractTranslatable
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::INTEGER)]
    #[Groups(['content:read', 'translations'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: ContentText::class, inversedBy: 'contentTextVariants')]
    #[ORM\JoinColumn(nullable: false)]
    private ?\App\Entity\ContentText $contentText = null;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Channel>
     */
    #[ORM\ManyToMany(targetEntity: Channel::class, inversedBy: 'contentTextVariants')]
    #[Groups(['content:read', 'content:write'])]
    private \Doctrine\Common\Collections\Collection $channels;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE)]
    #[Groups(['content:read'])]
    private $createdAt;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['content:read'])]
    private $updatedAt;

    #[Groups(['content:read'])]
    protected $text;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\ContentTextVariantTranslation>|\App\Entity\ContentTextVariantTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'ContentTextVariantTranslation', mappedBy: 'translatable', fetch: 'EAGER', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['content:write', 'translations'])]
    protected Collection $translations;

    public $timezone = 'Africa/Nairobi';

    public function __construct()
    {
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        parent::__construct();
        $this->channels = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContentText(): ?ContentText
    {
        return $this->contentText;
    }

    public function setContentText(?ContentText $contentText): self
    {
        $this->contentText = $contentText;

        return $this;
    }

    /**
     * @return Collection|Channel[]
     */
    public function getChannels(): Collection
    {
        return $this->channels;
    }

    public function addChannel(Channel $channel): self
    {
        if (!$this->channels->contains($channel)) {
            $this->channels[] = $channel;
        }

        return $this;
    }

    public function removeChannel(Channel $channel): self
    {
        $this->channels->removeElement($channel);

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

    protected function createTranslation(): TranslationInterface
    {
        return new ContentTextVariantTranslation();
    }

    public function setText(string $text): void
    {
        $this->getTranslation()->setTitle($text);
    }

    public function getText(): ?string
    {
        return $this->getTranslation()->getText();
    }

    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeUpdate(){
        $this->setUpdatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }

    /**
     * @throws \Exception
     */
    #[ORM\PrePersist]
    public function beforeSave(){
        $this->setCreatedAt(new \DateTimeImmutable('now', new \DateTimeZone($this->timezone)));
    }
}
