import { createClient } from 'contentful'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import Image from 'next/image'

// initial contentfull client
const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY
})

export const getStaticPaths = async () => {
  
  // fetch contentful
  // get all content recipe
  const res = await client.getEntries({
    content_type: 'recipe'
  });

  // ini di looping semua data di slug
  // jadi nanti ini bakal nyocokin sama data yang ada di params url
  const paths = res.items.map(item => {
    return {
      params: { slug: item.fields.slug }
    }
  })

  return {
    paths,
    fallback: false
  }

}

export async function getStaticProps({ params }) {

  // params contains the recipes `slug`.
  // If the route is like /recipes/1, then params.slug is 1
  // fetch contentfull by slug in params url
  const { items } = await client.getEntries({
    content_type: 'recipe',
    'fields.slug': params.slug
  });

  return {
    props: { recipe: items[0] },
    revalidate: 1
  }
}

export default function RecipeDetails({ recipe }) {

  const { featuredImage, title, cookingTime, ingredients, method  } = recipe.fields

  return (
    <div>
      <div className="banner">
        <Image 
          src={'https:' + featuredImage.fields.file.url}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
          layout="responsive"
        />
        <h2>{ title }</h2>
      </div>

      <div className="info">
        <p>Takes about { cookingTime } mins to cook.</p>
        <h3>Ingredients:</h3>

        {ingredients.map(ing => (
          <span key={ing}>{ ing }</span>
        ))}
      </div>
        
      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
      `}</style>
    </div>
  )
}