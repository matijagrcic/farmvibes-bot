
## Introduction

API documentation can be created by reading special identifiers and comments embedded in PHP code.

For class documentation and method prototypes, [phpDocumentor](https://www.phpdoc.org/) 

is an adequate tool for the job.

## Documentaion Tool setup

- Download the latest [PHAR](https://www.phpdoc.org/phpDocumentor.phar) file 
  and save it somwhere in your local drive eg C:\PHPdocs.
- Add the path to phpDocumentor.phar to the environment path on Windows.
- In linux, run `$ chmod +x phpDocumentor.phar` command on the terminal 

  to make the phpDocumentor.phar executable. 

  Then move the executable to /usr/local/bin directory

  `$ sudo mv phpDocumentor.phar /usr/local/bin`

## Generating documentation

User wishing to read the documentation will have to provide the path to source file or directory 

from where to generate the documentation.

The source path would be the project's full src directory path.

This is defined using -d switch tag.

The generated documentation path will also have to be defined, this is done by using the -t switch tag. 

The shell command synax for generating documentation is shown below.

  `php <path to the phpDocumentor>\phpDocumentor.phar -d <path to the project/src>  -t <path to store the documentation>`
  
  Example php C:\PHPdocs\phpDocumentor.phar -d ./src  -t c:/docs/api


 ## Read more

 [phpDocumentor](https://docs.phpdoc.org/3.0/guide/getting-started/generating-documentation.html)

 [PHPDoc reference](https://docs.phpdoc.org/3.0/guide/references/phpdoc/index.html)


	
