import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { MerComponent } from "../MerComponent";
import { toast } from "react-toastify";
import { fetcher, fetcherBlob } from "../../helper";

const ItemStatus = {
  ItemStatusInitial: 0,
  ItemStatusOnSale: 1,
  ItemStatusSoldOut: 2,
} as const;

type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

interface Item {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  user_id: number;
  price: number;
  status: ItemStatus;
  description: string;
}

export const ItemDetail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [item, setItem] = useState<Item>();
  const [itemImage, setItemImage] = useState<Blob>();
  const [cookies] = useCookies(["token", "userID"]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchItem = () => {
    fetcher<Item>(`/items/${params.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res);
        setItem(res);
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });

    fetcherBlob(`/items/${params.id}/image`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res);
        setItemImage(res);
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };

  const onSubmit = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    fetcher<Item[]>(`/purchase/${params.id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
      body: JSON.stringify({
        user_id: Number(cookies.userID),
      }),
    })
    //!ボタンを押したら,ページをreloadするのではなく、一部更新する
     .then((_) => {
      fetchItem();
      })
      .catch((err) => {
        console.log(`POST error:`, err);
        toast.error(err.message);
        //!ここbackendからのmessageを表示させたい
        setErrorMessage("This item is listed by you!");
      });
  };

  useEffect(() => {
    fetchItem();
  }, []);

  return (
    <div className="ItemDetail">
      <MerComponent condition={() => item !== undefined}>
        {item && itemImage && (
          <div className="ItemDetailContainer">
            <img
              height={480}
              width={480}
              src={URL.createObjectURL(itemImage)}
              alt="item"
              onClick={() => navigate(`/item/${item.id}`)}
            />
            <div className="Detail">
            <p>
              <span>Item Name: {item.name}</span>
              <br />
              <span>Price: {item.price}</span>
              <br />
              <span>UserID: {item.user_id}</span>
              <br />
              <span>Category: {item.category_name}</span>
              <br />
              <span>Description: {item.description}</span>
            </p>
            {item.status == ItemStatus.ItemStatusSoldOut ? (
              <button disabled={true} onClick={onSubmit} id="MerDisableButton">
                SoldOut
              </button>
            ) : (
              <button onClick={onSubmit} id="MerButton">
                Purchase
              </button>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
          </div>
        )}
      </MerComponent>
    </div>
  );
};
