<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ORM\Entity]
class QuestionTypeAttributeTranslation extends AbstractTranslation
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    protected ?string $id = null;

    #[ORM\ManyToOne(targetEntity: 'QuestionTypeAttribute', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;


    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 50)]
    #[Groups(['question:write', 'translations'])]
    private ?string $name = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING)]
    #[Groups(['question:write', 'translations'])]
    protected ?string $locale = null;

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
