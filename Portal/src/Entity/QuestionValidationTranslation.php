<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ORM\Entity]
class QuestionValidationTranslation extends AbstractTranslation
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    #[Groups(['questionValidation:read', 'translations', 'question:read'])]
    protected $id;

    #[ORM\ManyToOne(targetEntity: 'QuestionValidation', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 255, nullable: true)]
    #[Groups(['questionValidation:read', 'questionValidation:write', 'translations', 'question:read'])]
    private ?string $errorMessage = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['questionValidation:write', 'translations', 'question:read'])]
    protected ?string $locale = null;

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getErrorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function setErrorMessage(string $errorMessage): self
    {
        $this->errorMessage = $errorMessage;

        return $this;
    }

    
}
