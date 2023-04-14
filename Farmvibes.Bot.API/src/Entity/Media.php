<?php

namespace App\Entity;

use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\MediaRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Controller\MediaUploadController;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslatable;
use Locastic\ApiPlatformTranslationBundle\Model\TranslationInterface;
use Doctrine\DBAL\Types\Types;

#[ApiResource(operations: [new Get(), new Put(), new Patch(), new Delete(), new GetCollection(), new Post(uriTemplate: '/media/upload_media_file', controller: MediaUploadController::class, deserialize: false, openapiContext: ['requestBody' => ['description' => 'File Upload', 'required' => true, 'content' => ['multipart/form-data' => ['schema' => ['type' => 'object', 'properties' => ['file' => ['type' => 'string', 'format' => 'binary', 'description' => 'File to be uploaded'], 'description' => ['description' => 'User may use this property field to give a description about the media file being uploaded.', 'type' => 'string', 'required' => true], 'caption' => ['description' => 'Caption text that would appear when the media content associated with this caption is been rendered by the bot to the user.', 'type' => 'string', 'required' => true]]]]]]])], normalizationContext: ['groups' => ['media:read'], 'swagger_definition_name' => 'Read'], denormalizationContext: ['groups' => ['media:write'], 'swagger_definition_name' => 'Write'])]
#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Media extends AbstractTranslatable
{
    #[ORM\Column(type: Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['media:read', 'service:read', 'question:read', 'content:read'])]
    private $id;

    #[ORM\Column(type: Types::STRING, length: 20)]
    #[Groups(['media:read', 'service:read', 'question:read', 'content:read'])]
    private ?string $filetype = null;

    #[ORM\Column(type: Types::STRING, length: 255)]
    #[Groups(['media:read', 'media:write', 'service:read', 'question:read', 'content:read'])]
    private ?string $description = null;

    #[Groups(['media:read', 'media:write', 'service:read', 'question:read', 'content:read'])]
    private $caption;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private $updatedAt;

    /**
     * @var \Doctrine\Common\Collections\Collection<int, \App\Entity\MediaTranslation>|\App\Entity\MediaTranslation[]
     */
    #[ORM\OneToMany(targetEntity: 'MediaTranslation', mappedBy: 'translatable', fetch: 'EXTRA_LAZY', indexBy: 'locale', cascade: ['PERSIST'], orphanRemoval: true)]
    #[Groups(['media:write', 'translations'])]
    protected Collection $translations;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Question>
     */
    #[ORM\ManyToMany(targetEntity: Question::class, mappedBy: 'media')]
    private \Doctrine\Common\Collections\Collection $questions;

    /**
     * @var \Doctrine\Common\Collections\Collection<\App\Entity\Content>
     */
    #[ORM\ManyToMany(targetEntity: Content::class, mappedBy: 'media')]
    private \Doctrine\Common\Collections\Collection $contents;

    /**
     * Property to handle file uploads
     */
    private $file;

    public $timezone = 'Africa/Nairobi';

    #[ORM\Column(type: Types::STRING, length: 512)]
    #[Groups(['media:read', 'service:read', 'question:read', 'content:read'])]
    private ?string $pathUrl = null;

    public function __construct()
    {
        parent::__construct();
        $this->translations = new \Doctrine\Common\Collections\ArrayCollection();
        $this->questions = new ArrayCollection();
        $this->contents = new ArrayCollection();
    }
    public function getId() : ?string
    {
        return $this->id;
    }
    public function getFiletype() : ?string
    {
        return $this->filetype;
    }
    public function setFiletype(string $filetype) : self
    {
        $this->filetype = $filetype;
        return $this;
    }
    public function getDescription() : ?string
    {
        return $this->description;
    }
    public function setDescription(string $description) : self
    {
        $this->description = $description;
        return $this;
    }
    /**
     * @param UploadedFile $file
     */
    public function setFile(UploadedFile $file = null)
    {
        $this->file = $file;
    }
    /**
     * @return UploadedFile
     */
    public function getFile()
    {
        return $this->file;
    }
    public function getCaption() : ?string
    {
        return $this->getTranslation()->getCaption();
    }
    public function setCaption(string $caption) : self
    {
        $this->getTranslation()->setCaption($caption);
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
    public function __toString()
    {
        return $this->getDescription() === null ? "New" : $this->getDescription();
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
            $question->addMedium($this);
        }
        return $this;
    }
    public function removeQuestion(Question $question) : self
    {
        if ($this->questions->removeElement($question)) {
            $question->removeMedium($this);
        }
        return $this;
    }
    /**
     * @return Collection|Content[]
     */
    public function getContents() : Collection
    {
        return $this->contents;
    }
    public function addContent(Content $content) : self
    {
        if (!$this->contents->contains($content)) {
            $this->contents[] = $content;
            $content->addMedium($this);
        }
        return $this;
    }
    public function removeContent(Content $content) : self
    {
        if ($this->contents->removeElement($content)) {
            $content->removeMedium($this);
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
    public function getPathUrl() : ?string
    {
        return $this->pathUrl;
    }
    public function setPathUrl(string $pathUrl) : self
    {
        $this->pathUrl = $pathUrl;
        return $this;
    }
    protected function createTranslation() : TranslationInterface
    {
        return new MediaTranslation();
    }
}
