<?php

namespace App\Entity;

use Locastic\ApiPlatformTranslationBundle\Model\TranslatableInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Locastic\ApiPlatformTranslationBundle\Model\AbstractTranslation;
use Symfony\Component\Serializer\Annotation\Groups;
use Doctrine\DBAL\Types\Types;
use Symfony\Bridge\Doctrine\IdGenerator\UuidGenerator;

#[ORM\Entity]
class QuestionOptionTranslation extends AbstractTranslation
{
    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::GUID)]
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: UuidGenerator::class)]
    #[Assert\Uuid]
    private $id;

    #[ORM\ManyToOne(targetEntity: 'QuestionOption', inversedBy: 'translations')]
    protected ?TranslatableInterface $translatable = null;
    
    #[ORM\Column(type: Types::STRING, length: 150)]
    #[Groups(['translations', 'service:write', 'questionOption:write', 'question:write'])]
    private ?string $value = null;

    #[ORM\Column(type: \Doctrine\DBAL\Types\Types::STRING, length: 7)]
    #[Groups(['service:write', 'questionOption:write', 'question:write', 'translations'])]
    protected ?string $locale = null;

    public function getValue(): ?string
    {
        return $this->value;
    }

    public function setValue(string $value): void
    {
        $this->value = $value;
    }
}
